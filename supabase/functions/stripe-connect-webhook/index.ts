/**
 * Stripe Connect Webhook Edge Function
 *
 * Receives webhook events from Stripe and processes them.
 * Uses async signature verification (SubtleCryptoProvider) for Deno compatibility.
 *
 * Handles:
 *   - account.updated (Connect onboarding status)
 *   - capability.updated
 *   - payment_intent.succeeded (auto-close deals, mark invoices/commissions paid)
 *   - checkout.session.completed (same as above for checkout flow)
 *   - customer.subscription.updated / deleted (sync subscription tiers)
 *
 * Environment secrets required:
 *   STRIPE_SECRET_KEY              – Your platform's Stripe secret key
 *   STRIPE_CONNECT_WEBHOOK_SECRET  – Webhook signing secret (whsec_…)
 */

import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_CONNECT_WEBHOOK_SECRET");

  if (!stripeSecretKey || !webhookSecret) {
    console.error("Missing STRIPE_SECRET_KEY or STRIPE_CONNECT_WEBHOOK_SECRET");
    return new Response(
      JSON.stringify({ error: "Webhook secrets not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const stripeClient = new Stripe(stripeSecretKey, { apiVersion: "2025-08-27.basil" });
  const cryptoProvider = Stripe.createSubtleCryptoProvider();

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  let event: Stripe.Event;

  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
      console.error("Missing stripe-signature header");
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use async verification — required in Deno (no Node.js crypto)
    event = await stripeClient.webhooks.constructEventAsync(
      body,
      sig,
      webhookSecret,
      undefined,
      cryptoProvider
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Webhook signature verification failed:", msg);
    return new Response(
      JSON.stringify({ error: `Webhook verification failed: ${msg}` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Signature verified — always return 200 from here to avoid Stripe retries
  try {
    console.log(`Stripe event received: ${event.type} (${event.id})`);

    // ── account.updated ──────────────────────────────────────────────
    if (event.type === "account.updated") {
      const account = (event as any).data?.object;
      const accountId = account?.id;
      if (accountId) {
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

    // ── capability.updated ───────────────────────────────────────────
    if (event.type === "capability.updated") {
      const capability = (event as any).data?.object;
      console.log(`Capability ${capability?.id} updated for ${capability?.account}, status: ${capability?.status}`);
    }

    // ── payment_intent.succeeded ─────────────────────────────────────
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = (event as any).data?.object;
      const dealId = paymentIntent?.metadata?.deal_id;
      if (dealId) {
        console.log(`Payment succeeded for deal: ${dealId}`);
        await supabaseAdmin
          .from("deals")
          .update({ status: "completed", completed_at: new Date().toISOString() })
          .eq("id", dealId);

        const invoiceId = paymentIntent?.metadata?.invoice_id;
        if (invoiceId) {
          await handlePaymentCompletion(supabaseAdmin, dealId, invoiceId);
        }
      }
    }

    // ── checkout.session.completed ───────────────────────────────────
    if (event.type === "checkout.session.completed") {
      const session = (event as any).data?.object;
      const dealId = session?.metadata?.deal_id;
      const invoiceId = session?.metadata?.invoice_id;
      if (dealId && invoiceId && session?.payment_status === "paid") {
        console.log(`Checkout completed for deal: ${dealId}, invoice: ${invoiceId}`);
        await handlePaymentCompletion(supabaseAdmin, dealId, invoiceId);
      }
    }

    // ── subscription changes ─────────────────────────────────────────
    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = (event as any).data?.object;
      const customerId = subscription?.customer;
      const status = subscription?.status;
      const cancelAtPeriodEnd = subscription?.cancel_at_period_end || false;

      if (customerId) {
        console.log(`Subscription ${event.type} for customer: ${customerId}, status: ${status}`);

        const { data: existingSub } = await supabaseAdmin
          .from("subscriptions")
          .select("id, user_id, tier")
          .limit(1)
          .single();

        if (existingSub) {
          const statusMap: Record<string, string> = {
            active: "active", canceled: "canceled", past_due: "past_due",
            incomplete: "active", trialing: "trialing", unpaid: "past_due",
          };

          let tier = existingSub.tier;
          const items = subscription?.items?.data;
          if (items && items.length > 0) {
            const amount = items[0]?.price?.unit_amount || 0;
            if (amount >= 100000) tier = "obsidian";
            else if (amount >= 50000) tier = "elite";
            else if (amount >= 10000) tier = "professional";
            else tier = "free";
          }

          const updateData: Record<string, unknown> = {
            status: statusMap[status] || "active",
            cancel_at_period_end: cancelAtPeriodEnd,
            current_period_start: subscription?.current_period_start
              ? new Date(subscription.current_period_start * 1000).toISOString() : undefined,
            current_period_end: subscription?.current_period_end
              ? new Date(subscription.current_period_end * 1000).toISOString() : undefined,
          };
          if (tier !== existingSub.tier) (updateData as any).tier = tier;

          await supabaseAdmin.from("subscriptions").update(updateData).eq("id", existingSub.id);

          await supabaseAdmin.from("notifications").insert({
            user_id: existingSub.user_id,
            title: event.type === "customer.subscription.deleted"
              ? "Subscription Cancelled" : `Subscription Updated — ${tier}`,
            body: event.type === "customer.subscription.deleted"
              ? "Your subscription has been cancelled. You can resubscribe anytime."
              : cancelAtPeriodEnd
                ? "Your subscription will end at the current billing period."
                : `Your subscription has been updated to the ${tier} tier.`,
            category: "billing",
            severity: event.type === "customer.subscription.deleted" ? "warning" : "info",
            action_url: "/account/subscription",
          });

          console.log(`Subscription synced for user ${existingSub.user_id}: ${status}, tier: ${tier}`);
        }
      }
    }
  } catch (processingError) {
    // Log but still return 200 — the event was genuine, we just failed to process it
    console.error("Error processing webhook event:", processingError);
  }

  // Always return 200 for verified events to prevent Stripe from retrying
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

/** Shared logic for marking invoices/commissions paid + notifications + emails */
async function handlePaymentCompletion(
  supabaseAdmin: ReturnType<typeof createClient>,
  dealId: string,
  invoiceId: string
) {
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

  // In-app notification
  const { data: deal } = await supabaseAdmin
    .from("deals").select("user_id, deal_number").eq("id", dealId).single();

  if (deal?.user_id) {
    const { data: inv } = await supabaseAdmin
      .from("invoices")
      .select("amount_cents, currency, invoice_number, recipient_email, recipient_name")
      .eq("id", invoiceId).single();

    const symbol = (inv?.currency || "GBP").toUpperCase() === "GBP" ? "£" : "$";
    const amt = inv ? `${symbol}${(inv.amount_cents / 100).toLocaleString("en-GB", { minimumFractionDigits: 2 })}` : "";

    await supabaseAdmin.from("notifications").insert({
      user_id: deal.user_id,
      title: `Payment Received — ${amt}`,
      body: `Invoice ${inv?.invoice_number || ""} for deal ${deal.deal_number} has been paid.`,
      category: "payment",
      severity: "success",
      action_url: "/deal-completion",
      metadata: { deal_id: dealId, invoice_id: invoiceId },
    });

    // Payment receipt email
    if (inv?.recipient_email) {
      try {
        await supabaseAdmin.functions.invoke("send-transactional-email", {
          body: {
            template_name: "deal-completion-summary",
            recipient_email: inv.recipient_email,
            idempotency_key: `payment-received-${invoiceId}`,
            templateData: {
              customerName: inv.recipient_name || "Client",
              invoiceNumber: inv.invoice_number,
              amountPaid: amt,
            },
          },
        });
        console.log(`Payment receipt email sent to ${inv.recipient_email}`);
      } catch (emailErr) {
        console.error("Failed to send receipt email:", emailErr);
      }
    }
  }

  console.log(`Payment completion processed for deal ${dealId}, invoice ${invoiceId}`);
}
