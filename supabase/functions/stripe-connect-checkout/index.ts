/**
 * Stripe Connect Checkout Edge Function
 *
 * Creates a Stripe Checkout Session using "destination charges" so that:
 *   - The customer pays the platform
 *   - An application_fee_amount is retained by the platform
 *   - The remainder is automatically transferred to the connected account
 *
 * Environment secrets required:
 *   STRIPE_SECRET_KEY – Your platform's Stripe secret key
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@21.0.1";
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

  const stripeClient = new Stripe(stripeSecretKey);

  try {
    const { productId, productName, priceInCents, currency, quantity } =
      await req.json();

    if (!productId) {
      throw new Error("productId is required");
    }

    // Look up product and connected account server-side
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: product, error: dbError } = await supabaseAdmin
      .from("stripe_connect_products")
      .select("connected_account_id, name, price_cents, currency")
      .eq("id", productId)
      .single();

    if (dbError || !product) {
      throw new Error("Product not found");
    }

    const finalName = productName || product.name;
    const finalPrice = priceInCents || product.price_cents;
    const finalCurrency = currency || product.currency || "usd";

    const origin = req.headers.get("origin") || "http://localhost:5173";

    // Calculate the platform's application fee (10% of the sale price).
    const applicationFeeAmount = Math.round(finalPrice * 0.10);

    const session = await stripeClient.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: finalCurrency,
            product_data: { name: finalName },
            unit_amount: finalPrice,
          },
          quantity: quantity || 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: product.connected_account_id,
        },
      },
      mode: "payment",
      success_url: `${origin}/connect/storefront?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/connect/storefront?canceled=true`,
    });

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
