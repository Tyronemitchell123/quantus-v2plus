/**
 * Stripe Connect Webhook Edge Function
 *
 * Receives "thin" events from Stripe for V2 Connected Accounts.
 * Thin events contain only a reference ID — you must fetch the full event
 * from Stripe to get the payload.
 *
 * Listens for:
 *   - v2.core.account[requirements].updated
 *   - v2.core.account[.recipient].capability_status_updated
 *
 * Setup instructions:
 * 1. In Stripe Dashboard → Developers → Webhooks → + Add destination
 * 2. Select "Connected accounts" in Events from
 * 3. Click "Show advanced options" → Payload style: "Thin"
 * 4. Search for "v2" events and select the two types above
 * 5. Set the endpoint URL to: https://<project-ref>.supabase.co/functions/v1/stripe-connect-webhook
 * 6. Copy the webhook signing secret and add it as STRIPE_CONNECT_WEBHOOK_SECRET
 *
 * For local development with Stripe CLI:
 *   stripe listen \
 *     --thin-events 'v2.core.account[requirements].updated,v2.core.account[.recipient].capability_status_updated' \
 *     --forward-thin-to http://localhost:54321/functions/v1/stripe-connect-webhook
 *
 * Environment secrets required:
 *   STRIPE_SECRET_KEY              – Your platform's Stripe secret key
 *   STRIPE_CONNECT_WEBHOOK_SECRET  – Webhook signing secret (whsec_…)
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_CONNECT_WEBHOOK_SECRET");

  if (!stripeSecretKey) {
    return new Response(
      JSON.stringify({ error: "STRIPE_SECRET_KEY is not configured." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!webhookSecret) {
    // PLACEHOLDER: Add STRIPE_CONNECT_WEBHOOK_SECRET to your edge function secrets.
    // Get this from Stripe Dashboard → Developers → Webhooks → your endpoint → Signing secret
    return new Response(
      JSON.stringify({ error: "STRIPE_CONNECT_WEBHOOK_SECRET is not configured." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const stripeClient = new Stripe(stripeSecretKey, { apiVersion: "2025-08-27.basil" });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // ── Step 1: Verify the webhook signature and parse the event ──────
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");
    if (!sig) throw new Error("Missing stripe-signature header");

    const event = stripeClient.webhooks.constructEvent(body, sig, webhookSecret);

    console.log(`Received Stripe Connect event: ${event.type}`);

    // ── Step 3: Handle each event type ────────────────────────────────────

    // Requirements changed on a connected account
    // This fires when regulators or Stripe update KYC/compliance requirements
    if (event.type === "account.updated") {
      const account = (event as any).data?.object;
      const accountId = account?.id;
      if (accountId) {
        console.log(`Account updated: ${accountId}`);

        const needsAction =
          (account.requirements?.currently_due?.length > 0) ||
          (account.requirements?.past_due?.length > 0);

        await supabaseAdmin
          .from("stripe_connected_accounts")
          .update({ onboarding_complete: !needsAction })
          .eq("stripe_account_id", accountId);

        console.log(`Account ${accountId} needs action: ${needsAction}`);
      }
    }

    // Capability status changed on a connected account
    if (event.type === "capability.updated") {
      const capability = (event as any).data?.object;
      const accountId = capability?.account;
      if (accountId) {
        console.log(`Capability ${capability?.id} updated for account: ${accountId}, status: ${capability?.status}`);
      }
    }

    // ── Step 4: Handle payment_intent.succeeded → auto-close deals ──────
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = (event as any).data?.object;
      const dealId = paymentIntent?.metadata?.deal_id;
      if (dealId) {
        console.log(`Payment succeeded for deal: ${dealId}, auto-completing.`);
        await supabaseAdmin
          .from("deals")
          .update({ status: "completed", completed_at: new Date().toISOString() })
          .eq("id", dealId);

        const invoiceId = paymentIntent?.metadata?.invoice_id;
        if (invoiceId) {
          const now = new Date().toISOString();
          await supabaseAdmin
            .from("invoices")
            .update({ status: "paid", paid_at: now, updated_at: now })
            .eq("id", invoiceId);

          await supabaseAdmin
            .from("commission_logs")
            .update({ status: "paid", paid_at: now, invoice_id: invoiceId })
            .eq("deal_id", dealId)
            .in("status", ["pending", "expected", "processing"]);

          console.log(`Commissions for deal ${dealId} marked as paid via invoice ${invoiceId}`);

          // Insert in-app notification for the deal owner
          const { data: deal } = await supabaseAdmin.from("deals").select("user_id, deal_number").eq("id", dealId).single();
          if (deal?.user_id) {
            const { data: inv2 } = await supabaseAdmin.from("invoices").select("amount_cents, currency, invoice_number").eq("id", invoiceId).single();
            const symbol = (inv2?.currency || "GBP").toUpperCase() === "GBP" ? "£" : "$";
            const amt = inv2 ? `${symbol}${(inv2.amount_cents / 100).toLocaleString("en-GB", { minimumFractionDigits: 2 })}` : "";
            await supabaseAdmin.from("notifications").insert({
              user_id: deal.user_id,
              title: `Payment Received — ${amt}`,
              body: `Invoice ${inv2?.invoice_number || ""} for deal ${deal.deal_number} has been paid.`,
              category: "payment",
              severity: "success",
              action_url: "/deal-completion",
              metadata: { deal_id: dealId, invoice_id: invoiceId },
            });
            console.log(`Payment notification created for user ${deal.user_id}`);
          }

          // Send deal-completion notification email
          const { data: inv } = await supabaseAdmin.from("invoices").select("recipient_email, recipient_name, invoice_number, amount_cents, currency").eq("id", invoiceId).single();
          if (inv?.recipient_email) {
            const symbol = (inv.currency || "GBP").toUpperCase() === "GBP" ? "£" : "$";
            const amt = `${symbol}${(inv.amount_cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
            await supabaseAdmin.functions.invoke("send-transactional-email", {
              body: {
                template_name: "deal-completion-summary",
                recipient_email: inv.recipient_email,
                idempotency_key: `payment-received-${invoiceId}`,
                templateData: { customerName: inv.recipient_name || "Client", invoiceNumber: inv.invoice_number, amountPaid: amt },
              },
            });
            console.log(`Payment receipt email sent to ${inv.recipient_email}`);
          }
        }
      }
    }

    // ── Step 5: Handle checkout.session.completed → same logic for checkout flow
    if (event.type === "checkout.session.completed") {
      const session = (event as any).data?.object;
      const paymentIntent = session?.payment_intent;
      // If payment_intent metadata was set, it's already handled above
      // This handles direct checkout metadata
      const dealId = session?.metadata?.deal_id;
      const invoiceId = session?.metadata?.invoice_id;
      if (dealId && invoiceId && session?.payment_status === "paid") {
        const now = new Date().toISOString();
        console.log(`Checkout completed for deal: ${dealId}, invoice: ${invoiceId}`);

        await supabaseAdmin
          .from("invoices")
          .update({ status: "paid", paid_at: now, updated_at: now })
          .eq("id", invoiceId);

        await supabaseAdmin
          .from("commission_logs")
          .update({ status: "paid", paid_at: now, invoice_id: invoiceId })
          .eq("deal_id", dealId)
          .in("status", ["pending", "expected", "processing"]);

        console.log(`Commissions for deal ${dealId} marked as paid via checkout`);
      }
    }

    // Always respond 200 to acknowledge receipt — Stripe retries on non-2xx
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Webhook error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
