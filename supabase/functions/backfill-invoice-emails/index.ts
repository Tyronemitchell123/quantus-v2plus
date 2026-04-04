/**
 * Backfill Invoice Emails Edge Function
 *
 * Finds invoices with no recipient_email, attempts to resolve emails from
 * the vendors table, accepts manual overrides, creates Stripe Checkout
 * sessions for invoices missing checkout URLs, and sends payment reminders.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const db = createClient(supabaseUrl, serviceKey);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const origin = "https://quantus-v2plus.lovable.app";
    const MAX_STRIPE_CENTS = 99999999;

    // Parse optional manual overrides: { overrides: { invoice_id: "email@example.com" } }
    let overrides: Record<string, string> = {};
    try {
      const body = await req.json();
      if (body?.overrides && typeof body.overrides === "object") {
        overrides = body.overrides;
      }
    } catch {
      // No body or invalid JSON — proceed without overrides
    }

    // 1. Fetch invoices with no recipient_email and status = 'sent'
    const { data: invoicesRaw, error: fetchErr } = await db
      .from("invoices")
      .select("*, deals(deal_number, category)")
      .eq("status", "sent")
      .is("recipient_email", null)
      .order("created_at", { ascending: true });

    if (fetchErr) throw new Error(`Fetch error: ${fetchErr.message}`);
    if (!invoicesRaw || invoicesRaw.length === 0) {
      return new Response(
        JSON.stringify({ success: true, updated: 0, sent: 0, unresolved: 0, message: "No invoices need backfill" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[backfill] Processing ${invoicesRaw.length} invoices without emails`);

    // 2. For each invoice, try to resolve email
    // Strategy: commission_logs.vendor_name → vendors.email, then fallback to overrides
    const results: {
      invoice_number: string;
      status: string;
      email?: string;
      error?: string;
      checkout_created?: boolean;
    }[] = [];

    let updated = 0;
    let emailsSent = 0;
    let unresolved = 0;

    for (const inv of invoicesRaw) {
      try {
        let resolvedEmail: string | null = null;

        // Check manual override first
        if (overrides[inv.id]) {
          resolvedEmail = overrides[inv.id];
        }

        // Try commission_logs → vendors table match
        if (!resolvedEmail) {
          const { data: commLog } = await db
            .from("commission_logs")
            .select("vendor_name")
            .eq("deal_id", inv.deal_id)
            .not("vendor_name", "is", null)
            .limit(1)
            .maybeSingle();

          if (commLog?.vendor_name) {
            const { data: vendor } = await db
              .from("vendors")
              .select("email")
              .ilike("name", commLog.vendor_name)
              .not("email", "is", null)
              .limit(1)
              .maybeSingle();

            if (vendor?.email) {
              resolvedEmail = vendor.email;
            }
          }
        }

        // Try vendor_outreach table match
        if (!resolvedEmail) {
          const { data: outreach } = await db
            .from("vendor_outreach")
            .select("vendor_email")
            .eq("deal_id", inv.deal_id)
            .not("vendor_email", "is", null)
            .limit(1)
            .maybeSingle();

          if (outreach?.vendor_email) {
            resolvedEmail = outreach.vendor_email;
          }
        }

        if (!resolvedEmail) {
          unresolved++;
          results.push({
            invoice_number: inv.invoice_number,
            status: "unresolved",
            error: "No email found — provide manual override",
          });
          continue;
        }

        // 3. Update invoice with resolved email
        const updatePayload: Record<string, any> = {
          recipient_email: resolvedEmail,
          updated_at: new Date().toISOString(),
        };

        // 4. Create Stripe Checkout if missing
        const existingCheckoutUrl = inv.metadata?.checkout_url;
        let checkoutUrl = existingCheckoutUrl;
        let checkoutCreated = false;

        if (!checkoutUrl) {
          const dealLabel = inv.deals
            ? `${inv.deals.deal_number} (${inv.deals.category})`
            : inv.invoice_number;

          if (inv.amount_cents > MAX_STRIPE_CENTS) {
            const numParts = Math.ceil(inv.amount_cents / MAX_STRIPE_CENTS);
            const basePart = Math.floor(inv.amount_cents / numParts);
            const remainder = inv.amount_cents - basePart * numParts;
            const urls: string[] = [];

            for (let i = 0; i < numParts; i++) {
              const partAmount = basePart + (i < remainder ? 1 : 0);
              const session = await stripe.checkout.sessions.create({
                line_items: [{
                  price_data: {
                    currency: (inv.currency || "GBP").toLowerCase(),
                    product_data: {
                      name: `Invoice ${inv.invoice_number} — Part ${i + 1}/${numParts}`,
                      description: `Payment for deal ${dealLabel}`,
                    },
                    unit_amount: partAmount,
                  },
                  quantity: 1,
                }],
                mode: "payment",
                payment_intent_data: {
                  metadata: {
                    deal_id: inv.deal_id,
                    invoice_id: inv.id,
                    invoice_number: inv.invoice_number,
                    split_part: `${i + 1}/${numParts}`,
                  },
                },
                success_url: `${origin}/pay?status=success&invoice=${inv.invoice_number}`,
                cancel_url: `${origin}/pay?status=canceled&invoice=${inv.invoice_number}`,
              });
              urls.push(session.url!);
            }
            checkoutUrl = urls[0];
          } else {
            const session = await stripe.checkout.sessions.create({
              line_items: [{
                price_data: {
                  currency: (inv.currency || "GBP").toLowerCase(),
                  product_data: {
                    name: `Invoice ${inv.invoice_number}`,
                    description: `Payment for deal ${dealLabel}`,
                  },
                  unit_amount: inv.amount_cents,
                },
                quantity: 1,
              }],
              mode: "payment",
              payment_intent_data: {
                metadata: {
                  deal_id: inv.deal_id,
                  invoice_id: inv.id,
                  invoice_number: inv.invoice_number,
                },
              },
              success_url: `${origin}/pay?status=success&invoice=${inv.invoice_number}`,
              cancel_url: `${origin}/pay?status=canceled&invoice=${inv.invoice_number}`,
            });
            checkoutUrl = session.url!;
          }

          updatePayload.metadata = { ...(inv.metadata || {}), checkout_url: checkoutUrl };
          checkoutCreated = true;
        }

        // Apply update
        await db.from("invoices").update(updatePayload).eq("id", inv.id);
        updated++;

        // 5. Send payment reminder email
        const amountFormatted = new Intl.NumberFormat("en-GB", {
          style: "currency",
          currency: inv.currency || "GBP",
        }).format(inv.amount_cents / 100);

        const dealLabel = inv.deals
          ? `${inv.deals.deal_number} (${inv.deals.category})`
          : inv.invoice_number;

        const today = new Date().toISOString().slice(0, 10);

        await db.functions.invoke("send-transactional-email", {
          body: {
            templateName: "payment-reminder",
            recipientEmail: resolvedEmail,
            idempotencyKey: `backfill-${inv.id}-${today}`,
            templateData: {
              recipientName: inv.recipient_name || "Customer",
              invoiceNumber: inv.invoice_number,
              amount: amountFormatted,
              checkoutUrl,
              dealLabel,
            },
          },
        });

        emailsSent++;
        console.log(`[backfill] Updated ${inv.invoice_number} → ${resolvedEmail}, email sent`);

        results.push({
          invoice_number: inv.invoice_number,
          status: "updated",
          email: resolvedEmail,
          checkout_created: checkoutCreated,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[backfill] Failed ${inv.invoice_number}:`, msg);
        results.push({
          invoice_number: inv.invoice_number,
          status: "failed",
          error: msg,
        });
      }
    }

    console.log(`[backfill] Complete: ${updated} updated, ${emailsSent} emails sent, ${unresolved} unresolved`);

    return new Response(
      JSON.stringify({
        success: true,
        total: invoicesRaw.length,
        updated,
        emails_sent: emailsSent,
        unresolved,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[backfill] Error:", e);
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
