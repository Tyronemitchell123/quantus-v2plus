/**
 * Activate Invoices Edge Function
 * 
 * Bulk-activates all draft invoices by generating Stripe Checkout URLs
 * and sending payment reminder emails to vendors with email addresses.
 * Called by the deal-auto-progression cron or manually.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const db = createClient(supabaseUrl, serviceKey);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const origin = "https://quantus-v2plus.lovable.app";
    const MAX_STRIPE_CENTS = 99999999;

    // Fetch all draft invoices
    const { data: drafts, error: fetchErr } = await db
      .from("invoices")
      .select("*, deals(deal_number, category)")
      .eq("status", "draft")
      .order("created_at", { ascending: true });

    if (fetchErr) throw new Error(`Fetch error: ${fetchErr.message}`);
    if (!drafts || drafts.length === 0) {
      return new Response(
        JSON.stringify({ success: true, activated: 0, message: "No draft invoices" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[activate-invoices] Processing ${drafts.length} draft invoices`);

    const results: { invoice: string; status: string; url?: string; error?: string }[] = [];

    for (const inv of drafts) {
      try {
        const dealLabel = inv.deals
          ? `${inv.deals.deal_number} (${inv.deals.category})`
          : inv.invoice_number;

        let checkoutUrl: string;

        if (inv.amount_cents > MAX_STRIPE_CENTS) {
          // Split into parts
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
          checkoutUrl = urls[0]; // Primary URL
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

        // Update invoice status and store checkout URL
        await db
          .from("invoices")
          .update({
            status: "sent",
            metadata: { ...(inv.metadata || {}), checkout_url: checkoutUrl },
            updated_at: new Date().toISOString(),
          })
          .eq("id", inv.id);

        // Send payment reminder email if recipient has an email
        if (inv.recipient_email) {
          const amountFormatted = new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: inv.currency || "GBP",
          }).format(inv.amount_cents / 100);

          await db.functions.invoke("send-transactional-email", {
            body: {
              templateName: "payment-reminder",
              recipientEmail: inv.recipient_email,
              idempotencyKey: `invoice-activate-${inv.id}`,
              templateData: {
                recipientName: inv.recipient_name || "Customer",
                invoiceNumber: inv.invoice_number,
                amount: amountFormatted,
                checkoutUrl,
                dealLabel,
              },
            },
          });

          console.log(`[activate-invoices] Email sent to ${inv.recipient_email} for ${inv.invoice_number}`);
        }

        results.push({ invoice: inv.invoice_number, status: "activated", url: checkoutUrl });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[activate-invoices] Failed ${inv.invoice_number}:`, msg);
        results.push({ invoice: inv.invoice_number, status: "failed", error: msg });
      }
    }

    const activated = results.filter(r => r.status === "activated").length;
    console.log(`[activate-invoices] Complete: ${activated}/${drafts.length} activated`);

    return new Response(
      JSON.stringify({ success: true, activated, total: drafts.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[activate-invoices] Error:", e);
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
