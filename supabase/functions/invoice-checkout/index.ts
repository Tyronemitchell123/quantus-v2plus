/**
 * Invoice Checkout Edge Function
 *
 * Creates a Stripe Checkout session for a specific deal invoice.
 * When the customer pays, the stripe-connect-webhook marks the
 * invoice as paid and commissions as collected.
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

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    return new Response(
      JSON.stringify({ error: "STRIPE_SECRET_KEY not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // Authenticate
    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authErr } = await supabaseAnon.auth.getUser(token);
    if (authErr || !userData.user) throw new Error("Not authenticated");

    const { invoiceId, dealId } = await req.json();
    if (!invoiceId && !dealId) throw new Error("invoiceId or dealId is required");

    let invoice: any;

    if (invoiceId) {
      const { data, error } = await supabaseAdmin
        .from("invoices")
        .select("*")
        .eq("id", invoiceId)
        .eq("user_id", userData.user.id)
        .single();
      if (error || !data) throw new Error("Invoice not found");
      invoice = data;
    } else {
      // Get the first unpaid invoice for the deal
      const { data, error } = await supabaseAdmin
        .from("invoices")
        .select("*")
        .eq("deal_id", dealId)
        .eq("user_id", userData.user.id)
        .neq("status", "paid")
        .order("created_at", { ascending: true })
        .limit(1)
        .single();
      if (error || !data) throw new Error("No unpaid invoice found for this deal");
      invoice = data;
    }

    if (invoice.status === "paid") {
      throw new Error("This invoice has already been paid");
    }

    // Get deal info for description
    const { data: deal } = await supabaseAdmin
      .from("deals")
      .select("deal_number, category")
      .eq("id", invoice.deal_id)
      .single();

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const origin = req.headers.get("origin") || "https://quantus-loom.lovable.app";

    const dealLabel = deal
      ? `${deal.deal_number} (${deal.category})`
      : invoice.invoice_number;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: (invoice.currency || "GBP").toLowerCase(),
            product_data: {
              name: `Invoice ${invoice.invoice_number}`,
              description: `Payment for deal ${dealLabel}`,
            },
            unit_amount: invoice.amount_cents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_intent_data: {
        metadata: {
          deal_id: invoice.deal_id,
          invoice_id: invoice.id,
          invoice_number: invoice.invoice_number,
        },
      },
      success_url: `${origin}/completion?deal=${invoice.deal_id}&payment=success`,
      cancel_url: `${origin}/completion?deal=${invoice.deal_id}&payment=canceled`,
    });

    // Update invoice status to "sent"
    await supabaseAdmin
      .from("invoices")
      .update({ status: "sent", updated_at: new Date().toISOString() })
      .eq("id", invoice.id);

    return new Response(
      JSON.stringify({ url: session.url, invoiceId: invoice.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
