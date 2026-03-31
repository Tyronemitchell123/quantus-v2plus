/**
 * Stripe Connect Accounts Edge Function
 * 
 * Handles three operations for Stripe Connect:
 * 1. CREATE  – Creates a new V2 Connected Account (Express dashboard)
 * 2. LINK    – Generates an Account Link for onboarding
 * 3. STATUS  – Retrieves account onboarding/capability status
 *
 * Environment secrets required:
 *   STRIPE_SECRET_KEY – Your platform's Stripe secret key (sk_live_… or sk_test_…)
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@21.0.1";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

// ── CORS headers (required for browser requests) ──────────────────────────────
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // ── Validate Stripe secret key ────────────────────────────────────────────
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeSecretKey) {
    // PLACEHOLDER: Set your Stripe secret key in Supabase Edge Function secrets
    // You can add it via the Lovable secrets panel or Supabase dashboard
    return new Response(
      JSON.stringify({ error: "STRIPE_SECRET_KEY is not configured. Please add it to your edge function secrets." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // ── Initialise the Stripe client (latest SDK, API version auto-selected) ──
  const stripeClient = new Stripe(stripeSecretKey);

  // ── Supabase client (service role for DB writes) ──────────────────────────
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // ── Authenticate the calling user via JWT ─────────────────────────────────
  const supabaseAnon = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token);
    if (authError || !user) throw new Error("User not authenticated");

    const { action, displayName, contactEmail, stripeAccountId } = await req.json();

    // ── ACTION: CREATE ────────────────────────────────────────────────────────
    // Creates a V2 Connected Account with Express dashboard.
    // The platform is responsible for fees and losses (destination charges model).
    if (action === "create") {
      if (!displayName || !contactEmail) {
        throw new Error("displayName and contactEmail are required to create an account");
      }

      const account = await stripeClient.v2.core.accounts.create({
        display_name: displayName,
        contact_email: contactEmail,
        identity: {
          country: "gb",
        },
        dashboard: "express",
        defaults: {
          responsibilities: {
            fees_collector: "application",   // Platform collects fees
            losses_collector: "application", // Platform handles losses
          },
        },
        configuration: {
          recipient: {
            capabilities: {
              stripe_balance: {
                stripe_transfers: {
                  requested: true, // Enable payouts to this connected account
                },
              },
            },
          },
        },
      });

      // Store the mapping from our user to the Stripe account ID
      const { error: dbError } = await supabaseAdmin
        .from("stripe_connected_accounts")
        .upsert({
          user_id: user.id,
          stripe_account_id: account.id,
          display_name: displayName,
          contact_email: contactEmail,
        }, { onConflict: "user_id" });

      if (dbError) throw new Error(`DB error: ${dbError.message}`);

      return new Response(JSON.stringify({ accountId: account.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── ACTION: LINK ──────────────────────────────────────────────────────────
    // Generates an Account Link URL that redirects the user to Stripe's
    // hosted onboarding flow. After completing, they return to our app.
    if (action === "link") {
      if (!stripeAccountId) throw new Error("stripeAccountId is required");

      const origin = req.headers.get("origin") || "http://localhost:5173";

      const accountLink = await stripeClient.v2.core.accountLinks.create({
        account: stripeAccountId,
        use_case: {
          type: "account_onboarding",
          account_onboarding: {
            configurations: ["recipient"],
            refresh_url: `${origin}/connect/onboarding?refresh=true`,
            return_url: `${origin}/connect/onboarding?accountId=${stripeAccountId}`,
          },
        },
      });

      return new Response(JSON.stringify({ url: accountLink.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── ACTION: STATUS ────────────────────────────────────────────────────────
    // Retrieves the current onboarding and capability status of a connected
    // account directly from Stripe (single source of truth).
    if (action === "status") {
      if (!stripeAccountId) throw new Error("stripeAccountId is required");

      const account = await stripeClient.v2.core.accounts.retrieve(stripeAccountId, {
        include: ["configuration.recipient", "requirements"],
      });

      // Check if the account can receive payments
      const readyToReceivePayments =
        account?.configuration?.recipient?.capabilities?.stripe_balance?.stripe_transfers?.status === "active";

      // Check if onboarding requirements are satisfied
      const requirementsStatus = account.requirements?.summary?.minimum_deadline?.status;
      const onboardingComplete =
        requirementsStatus !== "currently_due" && requirementsStatus !== "past_due";

      // Persist the onboarding status in our DB for convenience
      await supabaseAdmin
        .from("stripe_connected_accounts")
        .update({ onboarding_complete: onboardingComplete })
        .eq("stripe_account_id", stripeAccountId);

      return new Response(
        JSON.stringify({
          accountId: stripeAccountId,
          readyToReceivePayments,
          onboardingComplete,
          requirementsStatus: requirementsStatus || "none",
          displayName: account.display_name,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
