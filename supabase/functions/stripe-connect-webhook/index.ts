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
import Stripe from "https://esm.sh/stripe@21.0.1";
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

  const stripeClient = new Stripe(stripeSecretKey);

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // ── Step 1: Verify the webhook signature and parse the thin event ──────
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");
    if (!sig) throw new Error("Missing stripe-signature header");

    // parseThinEvent validates the signature and returns a minimal event object
    const thinEvent = stripeClient.parseThinEvent(body, sig, webhookSecret);

    // ── Step 2: Fetch the full event from Stripe ──────────────────────────
    // Thin events only contain the event ID — we need to retrieve the full
    // payload to understand what changed
    const event = await stripeClient.v2.core.events.retrieve(thinEvent.id);

    console.log(`Received Stripe Connect event: ${event.type}`);

    // ── Step 3: Handle each event type ────────────────────────────────────

    // Requirements changed on a connected account
    // This fires when regulators or Stripe update KYC/compliance requirements
    if (event.type === "v2.core.account[requirements].updated") {
      const accountId = event.related_object?.id;
      if (accountId) {
        console.log(`Requirements updated for account: ${accountId}`);

        // Fetch the latest account status to check if action is needed
        const account = await stripeClient.v2.core.accounts.retrieve(accountId, {
          include: ["requirements"],
        });

        const reqStatus = account.requirements?.summary?.minimum_deadline?.status;
        const needsAction = reqStatus === "currently_due" || reqStatus === "past_due";

        // Update our local record
        await supabaseAdmin
          .from("stripe_connected_accounts")
          .update({ onboarding_complete: !needsAction })
          .eq("stripe_account_id", accountId);

        console.log(
          `Account ${accountId} requirements status: ${reqStatus}, needs action: ${needsAction}`
        );
      }
    }

    // Capability status changed on a connected account
    // This fires when a capability (like stripe_transfers) becomes active or inactive
    if (event.type.includes("capability_status_updated")) {
      const accountId = event.related_object?.id;
      if (accountId) {
        console.log(`Capability status updated for account: ${accountId}`);

        // Fetch the latest status
        const account = await stripeClient.v2.core.accounts.retrieve(accountId, {
          include: ["configuration.recipient", "requirements"],
        });

        const transfersActive =
          account?.configuration?.recipient?.capabilities?.stripe_balance?.stripe_transfers?.status === "active";

        console.log(`Account ${accountId} transfers active: ${transfersActive}`);
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
