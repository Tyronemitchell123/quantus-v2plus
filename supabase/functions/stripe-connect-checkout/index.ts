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
    const { productName, priceInCents, currency, connectedAccountId, quantity } =
      await req.json();

    if (!productName || !priceInCents || !connectedAccountId) {
      throw new Error("productName, priceInCents, and connectedAccountId are required");
    }

    const origin = req.headers.get("origin") || "http://localhost:5173";

    // Calculate the platform's application fee (10% of the sale price).
    // Adjust this percentage to match your business model.
    const applicationFeeAmount = Math.round(priceInCents * 0.10);

    // Create a Checkout Session with destination charges.
    // The payment is collected on the platform account and funds are
    // automatically transferred to the connected account minus the fee.
    const session = await stripeClient.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: currency || "usd",
            product_data: { name: productName },
            unit_amount: priceInCents,
          },
          quantity: quantity || 1,
        },
      ],
      payment_intent_data: {
        // Platform keeps the application fee
        application_fee_amount: applicationFeeAmount,
        // Route the rest to the connected account
        transfer_data: {
          destination: connectedAccountId,
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
