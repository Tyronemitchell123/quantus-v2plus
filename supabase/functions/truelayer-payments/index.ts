import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, tl-signature, x-tl-signature",
};

// Use sandbox URLs — switch to production (auth.truelayer.com / api.truelayer.com) when going live
const TRUELAYER_AUTH_URL = "https://auth.truelayer-sandbox.com";
const TRUELAYER_API_URL = "https://api.truelayer-sandbox.com";
const TRUELAYER_JWKS_URL = "https://webhooks.truelayer-sandbox.com/.well-known/jwks";

// Cache JWKS keys for 1 hour
let cachedJwks: { keys: JsonWebKey[]; fetchedAt: number } | null = null;
const JWKS_CACHE_TTL_MS = 3600_000;

async function fetchJwks(): Promise<JsonWebKey[]> {
  if (cachedJwks && Date.now() - cachedJwks.fetchedAt < JWKS_CACHE_TTL_MS) {
    return cachedJwks.keys;
  }
  const res = await fetch(TRUELAYER_JWKS_URL);
  if (!res.ok) throw new Error(`Failed to fetch JWKS: ${res.status}`);
  const jwks = await res.json();
  cachedJwks = { keys: jwks.keys, fetchedAt: Date.now() };
  return jwks.keys;
}

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function verifyTlSignature(
  tlSignature: string,
  body: string,
): Promise<boolean> {
  try {
    // TrueLayer uses a JWS with detached payload
    // Format: header..signature (payload is the request body)
    const parts = tlSignature.split(".");
    if (parts.length !== 3) return false;

    const [headerB64, , signatureB64] = parts;
    const headerJson = JSON.parse(new TextDecoder().decode(base64UrlDecode(headerB64)));
    const kid = headerJson.kid as string;
    const alg = headerJson.alg as string;

    if (!kid || !alg) return false;

    // Fetch JWKS and find matching key
    const keys = await fetchJwks();
    const jwk = keys.find((k: any) => k.kid === kid);
    if (!jwk) {
      console.warn("No matching JWK found for kid:", kid);
      return false;
    }

    // Import the public key
    const algMapping: Record<string, RsaHashedImportParams | EcKeyImportParams> = {
      RS256: { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      RS384: { name: "RSASSA-PKCS1-v1_5", hash: "SHA-384" },
      RS512: { name: "RSASSA-PKCS1-v1_5", hash: "SHA-512" },
      ES256: { name: "ECDSA", namedCurve: "P-256" },
      ES384: { name: "ECDSA", namedCurve: "P-384" },
      ES512: { name: "ECDSA", namedCurve: "P-521" },
    };

    const importAlg = algMapping[alg];
    if (!importAlg) {
      console.warn("Unsupported algorithm:", alg);
      return false;
    }

    const cryptoKey = await crypto.subtle.importKey("jwk", jwk, importAlg, false, ["verify"]);

    // Reconstruct the JWS signing input: header.payload
    const encoder = new TextEncoder();
    const payloadB64 = btoa(body).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const signingInput = encoder.encode(`${headerB64}.${payloadB64}`);
    const signature = base64UrlDecode(signatureB64);

    // Choose verify algorithm
    let verifyAlg: AlgorithmIdentifier | RsaPssParams | EcdsaParams;
    if (alg.startsWith("ES")) {
      const hashSizes: Record<string, number> = { ES256: 32, ES384: 48, ES512: 66 };
      verifyAlg = { name: "ECDSA", hash: `SHA-${alg.slice(2)}` } as EcdsaParams;
    } else {
      verifyAlg = importAlg;
    }

    return await crypto.subtle.verify(verifyAlg, cryptoKey, signature, signingInput);
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}

async function getAccessToken(): Promise<string | null> {
  const clientId = Deno.env.get("TRUELAYER_CLIENT_ID");
  const clientSecret = Deno.env.get("TRUELAYER_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    return null;
  }

  try {
    const res = await fetch(`${TRUELAYER_AUTH_URL}/connect/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        scope: "paydirect",
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.warn(`TrueLayer auth failed [${res.status}]: ${err} — falling back to demo mode`);
      return null;
    }

    const data = await res.json();
    return data.access_token;
  } catch (e) {
    console.warn("TrueLayer auth error:", e, "— falling back to demo mode");
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id ?? null;
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (action === "create-payment") {
      if (!userId) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { tier, billing_cycle, seats } = await req.json();

      // Per-unit prices in minor currency (pence)
      const prices: Record<string, Record<string, number>> = {
        starter: { monthly: 49900, annual: 39900 },
        professional: { monthly: 149900, annual: 119900 },
        teams: { monthly: 4900, annual: 3900 }, // per user
        enterprise: { monthly: 0, annual: 0 },
      };

      const unitPrice = prices[tier]?.[billing_cycle];
      if (unitPrice === undefined || unitPrice === 0) {
        return new Response(
          JSON.stringify({ error: "Invalid tier or contact sales for enterprise" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Teams tier requires seats >= 1
      const seatCount = tier === "teams" ? Math.max(1, Math.floor(Number(seats) || 1)) : 1;
      const amountCents = unitPrice * seatCount;

      const accessToken = await getAccessToken();
      const paymentId = crypto.randomUUID();

      // If no valid TrueLayer credentials, use demo mode
      if (!accessToken) {
        const { data: payment } = await supabase.from("payments").insert({
          user_id: userId,
          truelayer_payment_id: `demo_${paymentId}`,
          amount_cents: amountCents,
          currency: "GBP",
          status: "executed",
          metadata: { tier, billing_cycle, seats: seatCount },
        }).select().single();

        await supabase.from("subscriptions").update({
          tier,
          status: "active",
          billing_cycle,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + (billing_cycle === "annual" ? 365 : 30) * 86400000).toISOString(),
        }).eq("user_id", userId);

        return new Response(
          JSON.stringify({
            success: true,
            demo: true,
            payment_id: payment?.id,
            message: "Subscription activated (demo mode)",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const paymentRes = await fetch(`${TRUELAYER_API_URL}/v3/payments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "Idempotency-Key": paymentId,
        },
        body: JSON.stringify({
          amount_in_minor: amountCents,
          currency: "GBP",
          payment_method: {
            type: "bank_transfer",
            provider_selection: { type: "user_selected" },
            beneficiary: {
              type: "merchant_account",
              merchant_account_id: Deno.env.get("TRUELAYER_MERCHANT_ACCOUNT_ID") || "",
            },
          },
          user: { id: userId },
          metadata: { tier, billing_cycle, user_id: userId, seats: seatCount },
        }),
      });

      if (!paymentRes.ok) {
        const err = await paymentRes.text();
        console.error("TrueLayer payment creation failed:", err);
        // Fallback to demo mode
        const { data: payment } = await supabase.from("payments").insert({
          user_id: userId,
          truelayer_payment_id: `demo_${paymentId}`,
          amount_cents: amountCents,
          currency: "GBP",
          status: "executed",
          metadata: { tier, billing_cycle, seats: seatCount },
        }).select().single();

        await supabase.from("subscriptions").update({
          tier,
          status: "active",
          billing_cycle,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + (billing_cycle === "annual" ? 365 : 30) * 86400000).toISOString(),
        }).eq("user_id", userId);

        return new Response(
          JSON.stringify({
            success: true,
            demo: true,
            payment_id: payment?.id,
            message: "Subscription activated (demo mode)",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const paymentData = await paymentRes.json();

      await supabase.from("payments").insert({
        user_id: userId,
        truelayer_payment_id: paymentData.id,
        amount_cents: amountCents,
        currency: "GBP",
        status: "pending",
        metadata: { tier, billing_cycle, truelayer_resource_token: paymentData.resource_token, seats: seatCount },
      });

      return new Response(
        JSON.stringify({
          success: true,
          payment_id: paymentData.id,
          resource_token: paymentData.resource_token,
          hosted_payment_page: paymentData.resource_token
            ? `https://payment.truelayer.com/payments#payment_id=${paymentData.id}&resource_token=${paymentData.resource_token}&return_uri=${encodeURIComponent(url.origin)}`
            : null,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "payment-status") {
      if (!userId) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .single();

      return new Response(JSON.stringify({ subscription: sub }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "webhook") {
      // TrueLayer V3 webhook format:
      // { "type": "payment_executed", "event_id": "...", "event_version": 1, "payment_id": "..." }
      // Possible types: payment_authorized, payment_executed, payment_settled, payment_failed
      const body = await req.json();
      const eventType = body.type as string | undefined;
      const paymentId = body.payment_id as string | undefined;

      console.log("Webhook received:", JSON.stringify({ eventType, paymentId }));

      if (paymentId && eventType) {
        // Map TrueLayer event type to our payment status
        const statusMap: Record<string, string> = {
          payment_authorized: "authorized",
          payment_executed: "executed",
          payment_settled: "settled",
          payment_failed: "failed",
        };
        const mappedStatus = statusMap[eventType] || eventType.replace("payment_", "");

        const { data: payment } = await supabase
          .from("payments")
          .select("*")
          .eq("truelayer_payment_id", paymentId)
          .single();

        if (payment) {
          await supabase.from("payments").update({ status: mappedStatus }).eq("id", payment.id);

          // Activate subscription on successful payment
          if (eventType === "payment_executed" || eventType === "payment_settled") {
            const meta = payment.metadata as Record<string, string>;
            await supabase.from("subscriptions").update({
              tier: meta.tier,
              status: "active",
              billing_cycle: meta.billing_cycle,
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(
                Date.now() + (meta.billing_cycle === "annual" ? 365 : 30) * 86400000
              ).toISOString(),
            }).eq("user_id", payment.user_id);
          }
        } else {
          console.warn("Webhook: no payment found for truelayer_payment_id:", paymentId);
        }
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("TrueLayer function error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
