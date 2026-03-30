import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRIORITY_PRICE_ID = "price_1TGovoLwCkGlk8CPn5vd7OLQ";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabaseClient.auth.getUser(token);
    if (userErr || !userData.user) throw new Error("Unauthorized");
    const user = userData.user;

    const { deal_id } = await req.json();
    if (!deal_id) throw new Error("deal_id is required");

    // Verify the deal belongs to this user and isn't already priority
    const { data: deal, error: dealErr } = await supabaseClient
      .from("deals")
      .select("id, is_priority, user_id")
      .eq("id", deal_id)
      .single();

    if (dealErr || !deal) throw new Error("Deal not found");
    if (deal.user_id !== user.id) throw new Error("Unauthorized");
    if (deal.is_priority) throw new Error("Deal is already priority");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Find or create Stripe customer
    const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const origin = req.headers.get("origin") || "https://quantus-loom.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email!,
      line_items: [{ price: PRIORITY_PRICE_ID, quantity: 1 }],
      mode: "payment",
      metadata: { deal_id, user_id: user.id, type: "priority_processing" },
      success_url: `${origin}/intake?priority=success&deal=${deal_id}`,
      cancel_url: `${origin}/intake?priority=canceled`,
    });

    // Mark deal as priority immediately (payment confirmation will finalize)
    await supabaseClient
      .from("deals")
      .update({ is_priority: true, priority_surcharge_cents: 4900 })
      .eq("id", deal_id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
