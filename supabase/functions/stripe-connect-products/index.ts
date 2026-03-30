/**
 * Stripe Connect Products Edge Function
 *
 * Handles two operations:
 * 1. CREATE  – Creates a Stripe Product + Price at the *platform* level,
 *              then stores the mapping to a connected account in our DB
 * 2. LIST    – Returns all products from our DB (for the storefront)
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

  // Service-role client for DB writes
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // Anon client for user authentication
  const supabaseAnon = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const { action, name, description, priceInCents, currency, connectedAccountId, filterAccountId } =
      await req.json();

    // ── ACTION: CREATE ──────────────────────────────────────────────────────
    // Creates a product on the *platform* Stripe account (not the connected
    // account). We store a mapping from product → connected account so that
    // checkout can route funds via destination charges.
    if (action === "create") {
      // Authenticate the user
      const authHeader = req.headers.get("Authorization")!;
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token);
      if (authError || !user) throw new Error("User not authenticated");

      if (!name || !priceInCents || !connectedAccountId) {
        throw new Error("name, priceInCents, and connectedAccountId are required");
      }

      // Create the product with an inline default price on the platform account
      const product = await stripeClient.products.create({
        name,
        description: description || undefined,
        default_price_data: {
          unit_amount: priceInCents,
          currency: currency || "usd",
        },
        // Store the connected account mapping in Stripe metadata too
        metadata: {
          connected_account_id: connectedAccountId,
        },
      });

      // Persist in our local DB for the storefront
      const { error: dbError } = await supabaseAdmin
        .from("stripe_connect_products")
        .insert({
          stripe_product_id: product.id,
          stripe_price_id: typeof product.default_price === "string"
            ? product.default_price
            : product.default_price?.id,
          connected_account_id: connectedAccountId,
          name,
          description: description || null,
          price_cents: priceInCents,
          currency: currency || "usd",
        });

      if (dbError) throw new Error(`DB error: ${dbError.message}`);

      return new Response(
        JSON.stringify({
          productId: product.id,
          priceId: typeof product.default_price === "string"
            ? product.default_price
            : product.default_price?.id,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── ACTION: LIST ────────────────────────────────────────────────────────
    // Returns all products from our DB along with connected account info.
    // No authentication needed — this powers the public storefront.
    if (action === "list") {
      const { data: products, error } = await supabaseAdmin
        .from("stripe_connect_products")
        .select("id, name, description, price_cents, currency, created_at, connected_account_id")
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);

      // Enrich with connected account display names
      const accountIds = [...new Set(products?.map((p) => p.connected_account_id) || [])];
      const { data: accounts } = await supabaseAdmin
        .from("stripe_connected_accounts")
        .select("stripe_account_id, display_name")
        .in("stripe_account_id", accountIds);

      const accountMap = new Map(
        (accounts || []).map((a) => [a.stripe_account_id, a.display_name])
      );

      // Return only storefront-safe fields — strip internal Stripe IDs
      const enriched = (products || []).map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price_cents: p.price_cents,
        currency: p.currency,
        created_at: p.created_at,
        seller_name: accountMap.get(p.connected_account_id) || "Unknown Seller",
      }));

      return new Response(JSON.stringify({ products: enriched }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
