/**
 * Backfill Invoice Emails Edge Function
 *
 * Handles three scenarios:
 * 1. Invoices missing recipient_email — resolves from vendors/outreach tables
 * 2. Invoices with expired/missing checkout URLs — creates fresh Stripe sessions
 * 3. Sends payment reminder emails for all updated invoices
 *
 * Accepts optional body: { overrides: { invoice_id: "email" }, flushQueue: boolean }
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/* ── helpers ── */

function isCheckoutExpired(metadata: Record<string, unknown> | null, createdAt: string): boolean {
  if (!metadata?.checkout_url) return true;
  // Use checkout_created_at if stored, otherwise fall back to invoice updated_at
  const refTime = (metadata.checkout_created_at as string) || createdAt;
  const ageMs = Date.now() - new Date(refTime).getTime();
  const TWENTY_THREE_HOURS = 23 * 60 * 60 * 1000;
  return ageMs > TWENTY_THREE_HOURS;
}

async function resolveEmail(
  db: ReturnType<typeof createClient>,
  inv: { id: string; deal_id: string },
  overrides: Record<string, string>,
): Promise<string | null> {
  // 1. Manual override
  if (overrides[inv.id]) return overrides[inv.id];

  // 2. commission_logs → vendors
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
    if (vendor?.email) return vendor.email;
  }

  // 3. vendor_outreach
  const { data: outreach } = await db
    .from("vendor_outreach")
    .select("vendor_email")
    .eq("deal_id", inv.deal_id)
    .not("vendor_email", "is", null)
    .limit(1)
    .maybeSingle();

  return outreach?.vendor_email ?? null;
}

async function createCheckoutSession(
  stripe: Stripe,
  inv: { invoice_number: string; amount_cents: number; currency: string; deal_id: string; id: string; deals?: { deal_number: string; category: string } | null },
  origin: string,
): Promise<string> {
  const MAX_STRIPE_CENTS = 99999999;
  const currency = (inv.currency || "GBP").toLowerCase();
  const dealLabel = inv.deals ? `${inv.deals.deal_number} (${inv.deals.category})` : inv.invoice_number;

  if (inv.amount_cents > MAX_STRIPE_CENTS) {
    const numParts = Math.ceil(inv.amount_cents / MAX_STRIPE_CENTS);
    const basePart = Math.floor(inv.amount_cents / numParts);
    const remainder = inv.amount_cents - basePart * numParts;
    const urls: string[] = [];

    for (let i = 0; i < numParts; i++) {
      const partAmount = basePart + (i < remainder ? 1 : 0);
      const session = await stripe.checkout.sessions.create({
        line_items: [{
          price_data: { currency, product_data: { name: `Invoice ${inv.invoice_number} — Part ${i + 1}/${numParts}`, description: `Payment for deal ${dealLabel}` }, unit_amount: partAmount },
          quantity: 1,
        }],
        mode: "payment",
        payment_intent_data: { metadata: { deal_id: inv.deal_id, invoice_id: inv.id, invoice_number: inv.invoice_number, split_part: `${i + 1}/${numParts}` } },
        success_url: `${origin}/pay?status=success&invoice=${inv.invoice_number}`,
        cancel_url: `${origin}/pay?status=canceled&invoice=${inv.invoice_number}`,
      });
      urls.push(session.url!);
    }
    return urls[0];
  }

  const session = await stripe.checkout.sessions.create({
    line_items: [{
      price_data: { currency, product_data: { name: `Invoice ${inv.invoice_number}`, description: `Payment for deal ${dealLabel}` }, unit_amount: inv.amount_cents },
      quantity: 1,
    }],
    mode: "payment",
    payment_intent_data: { metadata: { deal_id: inv.deal_id, invoice_id: inv.id, invoice_number: inv.invoice_number } },
    success_url: `${origin}/pay?status=success&invoice=${inv.invoice_number}`,
    cancel_url: `${origin}/pay?status=canceled&invoice=${inv.invoice_number}`,
  });
  return session.url!;
}

/* ── main handler ── */

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

    let overrides: Record<string, string> = {};
    try {
      const body = await req.json();
      if (body?.overrides && typeof body.overrides === "object") overrides = body.overrides;
    } catch { /* no body */ }

    // Fetch ALL sent invoices (not just those missing emails)
    const { data: invoicesRaw, error: fetchErr } = await db
      .from("invoices")
      .select("*, deals(deal_number, category)")
      .eq("status", "sent")
      .order("created_at", { ascending: true });

    if (fetchErr) throw new Error(`Fetch error: ${fetchErr.message}`);
    if (!invoicesRaw?.length) {
      return new Response(JSON.stringify({ success: true, updated: 0, sent: 0, unresolved: 0, refreshed: 0, message: "No sent invoices found" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log(`[backfill] Processing ${invoicesRaw.length} sent invoices`);

    const results: { invoice_number: string; status: string; email?: string; error?: string; checkout_refreshed?: boolean }[] = [];
    let updated = 0, emailsSent = 0, unresolved = 0, checkoutsRefreshed = 0;

    for (const inv of invoicesRaw) {
      try {
        const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
        let needsUpdate = false;

        // ── Resolve email if missing ──
        let email = inv.recipient_email;
        if (!email) {
          email = await resolveEmail(db, inv, overrides);
          if (!email) {
            unresolved++;
            results.push({ invoice_number: inv.invoice_number, status: "unresolved", error: "No email found — provide manual override" });
            continue;
          }
          updatePayload.recipient_email = email;
          needsUpdate = true;
        }

        // ── Refresh checkout URL if expired or missing ──
        let checkoutUrl = inv.metadata?.checkout_url as string | undefined;
        let checkoutRefreshed = false;

        if (isCheckoutExpired(inv.metadata, inv.updated_at)) {
          checkoutUrl = await createCheckoutSession(stripe, inv, origin);
          updatePayload.metadata = {
            ...(inv.metadata || {}),
            checkout_url: checkoutUrl,
            checkout_created_at: new Date().toISOString(),
          };
          needsUpdate = true;
          checkoutRefreshed = true;
          checkoutsRefreshed++;
        }

        if (needsUpdate) {
          await db.from("invoices").update(updatePayload).eq("id", inv.id);
          updated++;
        }

        // ── Send payment reminder ──
        if (checkoutUrl) {
          const amountFormatted = new Intl.NumberFormat("en-GB", { style: "currency", currency: inv.currency || "GBP" }).format(inv.amount_cents / 100);
          const dealLabel = inv.deals ? `${inv.deals.deal_number} (${inv.deals.category})` : inv.invoice_number;
          const today = new Date().toISOString().slice(0, 10);

          await db.functions.invoke("send-transactional-email", {
            body: {
              templateName: "payment-reminder",
              recipientEmail: email,
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
          console.log(`[backfill] ${inv.invoice_number} → ${email} (checkout ${checkoutRefreshed ? "refreshed" : "existing"})`);
        }

        results.push({ invoice_number: inv.invoice_number, status: needsUpdate ? "updated" : "reminder_sent", email, checkout_refreshed: checkoutRefreshed });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[backfill] Failed ${inv.invoice_number}:`, msg);
        results.push({ invoice_number: inv.invoice_number, status: "failed", error: msg });
      }
    }

    console.log(`[backfill] Done: ${updated} updated, ${checkoutsRefreshed} checkouts refreshed, ${emailsSent} emails queued, ${unresolved} unresolved`);

    return new Response(JSON.stringify({
      success: true, total: invoicesRaw.length, updated, checkouts_refreshed: checkoutsRefreshed,
      emails_sent: emailsSent, unresolved, results,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("[backfill] Error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
