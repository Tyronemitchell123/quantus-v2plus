import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@17.7.0";
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

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeSecretKey) {
    return new Response(
      JSON.stringify({ error: "STRIPE_SECRET_KEY is not configured." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-12-18.acacia" });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

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

    // ── ACTION: CREATE ──
    if (action === "create") {
      if (!displayName || !contactEmail) {
        throw new Error("displayName and contactEmail are required");
      }

      const account = await stripe.accounts.create({
        type: "express",
        country: "GB",
        email: contactEmail,
        business_profile: {
          name: displayName,
        },
        capabilities: {
          transfers: { requested: true },
        },
      });

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

    // ── ACTION: LINK ──
    if (action === "link") {
      if (!stripeAccountId) throw new Error("stripeAccountId is required");

      const origin = req.headers.get("origin") || "http://localhost:5173";

      const accountLink = await stripe.accountLinks.create({
        account: stripeAccountId,
        type: "account_onboarding",
        refresh_url: `${origin}/connect/onboarding?refresh=true`,
        return_url: `${origin}/connect/onboarding?accountId=${stripeAccountId}`,
      });

      return new Response(JSON.stringify({ url: accountLink.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── ACTION: STATUS ──
    if (action === "status") {
      if (!stripeAccountId) throw new Error("stripeAccountId is required");

      const account = await stripe.accounts.retrieve(stripeAccountId);

      const readyToReceivePayments = account.capabilities?.transfers === "active";
      const onboardingComplete =
        !account.requirements?.currently_due?.length &&
        !account.requirements?.past_due?.length;

      await supabaseAdmin
        .from("stripe_connected_accounts")
        .update({ onboarding_complete: onboardingComplete })
        .eq("stripe_account_id", stripeAccountId);

      return new Response(
        JSON.stringify({
          accountId: stripeAccountId,
          readyToReceivePayments,
          onboardingComplete,
          displayName: account.business_profile?.name || null,
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
