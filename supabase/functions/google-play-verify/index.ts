import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Tier mapping: Google Play product IDs → internal subscription tiers
const PRODUCT_TIER_MAP: Record<string, string> = {
  "quantus_starter_monthly": "starter",
  "quantus_starter_annual": "starter",
  "quantus_professional_monthly": "professional",
  "quantus_professional_annual": "professional",
};

const PRODUCT_CYCLE_MAP: Record<string, string> = {
  "quantus_starter_monthly": "monthly",
  "quantus_starter_annual": "annual",
  "quantus_professional_monthly": "monthly",
  "quantus_professional_annual": "annual",
};

/** Check if real Google credentials are configured */
function hasRealCredentials(): boolean {
  return !!(
    Deno.env.get("GOOGLE_PLAY_SERVICE_EMAIL") &&
    Deno.env.get("GOOGLE_PLAY_PRIVATE_KEY")
  );
}

/** Get a Google OAuth2 access token using the service account */
async function getGoogleAccessToken(): Promise<string> {
  const email = Deno.env.get("GOOGLE_PLAY_SERVICE_EMAIL")!;
  const rawKey = Deno.env.get("GOOGLE_PLAY_PRIVATE_KEY")!;
  // The private key arrives with literal \n — convert to real newlines
  const privateKeyPem = rawKey.replace(/\\n/g, "\n");

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: email,
    scope: "https://www.googleapis.com/auth/androidpublisher",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const enc = (obj: unknown) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  const unsignedToken = `${enc(header)}.${enc(payload)}`;

  // Import the RSA private key
  const pemBody = privateKeyPem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const binaryKey = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const jwt = `${unsignedToken}.${sig}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Google OAuth failed: ${err}`);
  }
  const { access_token } = await tokenRes.json();
  return access_token;
}

/** Verify a subscription purchase token against the Google Play API */
async function verifyWithGoogle(
  packageName: string,
  subscriptionId: string,
  purchaseToken: string
) {
  const accessToken = await getGoogleAccessToken();
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/subscriptions/${subscriptionId}/tokens/${purchaseToken}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google Play API error (${res.status}): ${body}`);
  }
  return await res.json();
}

/** Demo mode: simulate a successful verification */
function demoVerification(productId: string, purchaseToken: string) {
  const now = Date.now();
  return {
    demo: true,
    orderId: `GPA.demo-${Date.now()}`,
    startTimeMillis: String(now),
    expiryTimeMillis: String(now + 30 * 24 * 60 * 60 * 1000), // +30 days
    paymentState: 1, // received
    cancelReason: undefined,
    productId,
    purchaseToken,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the calling user
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse body
    const { packageName, productId, purchaseToken } = await req.json();
    if (!productId || !purchaseToken) {
      return new Response(
        JSON.stringify({ error: "Missing productId or purchaseToken" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Determine tier from product ID
    const tier = PRODUCT_TIER_MAP[productId];
    const billingCycle = PRODUCT_CYCLE_MAP[productId] ?? "monthly";
    if (!tier) {
      return new Response(
        JSON.stringify({ error: `Unknown product ID: ${productId}` }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify the purchase — real or demo
    const isDemo = !hasRealCredentials();
    let verification: any;

    if (isDemo) {
      console.log("[DEMO MODE] Simulating Google Play verification");
      verification = demoVerification(productId, purchaseToken);
    } else {
      verification = await verifyWithGoogle(
        packageName ?? "com.quantus.ai",
        productId,
        purchaseToken
      );
    }

    // Check payment state (1 = received, 0 = pending, 2 = free trial)
    const paymentOk =
      isDemo ||
      verification.paymentState === 1 ||
      verification.paymentState === 2;

    if (!paymentOk) {
      return new Response(
        JSON.stringify({
          error: "Payment not received",
          paymentState: verification.paymentState,
        }),
        {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Sync entitlement to subscriptions table using service role
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const periodStart = verification.startTimeMillis
      ? new Date(Number(verification.startTimeMillis)).toISOString()
      : new Date().toISOString();
    const periodEnd = verification.expiryTimeMillis
      ? new Date(Number(verification.expiryTimeMillis)).toISOString()
      : null;

    // Upsert: update existing subscription or create new one
    const { data: existing } = await adminClient
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    let subError;
    if (existing) {
      const { error } = await adminClient
        .from("subscriptions")
        .update({
          tier,
          status: verification.paymentState === 2 ? "trialing" : "active",
          billing_cycle: billingCycle,
          current_period_start: periodStart,
          current_period_end: periodEnd,
          cancel_at_period_end: !!verification.cancelReason,
        })
        .eq("id", existing.id);
      subError = error;
    } else {
      const { error } = await adminClient.from("subscriptions").insert({
        user_id: user.id,
        tier,
        status: verification.paymentState === 2 ? "trialing" : "active",
        billing_cycle: billingCycle,
        current_period_start: periodStart,
        current_period_end: periodEnd,
        cancel_at_period_end: false,
      });
      subError = error;
    }

    if (subError) {
      console.error("Subscription sync error:", subError);
      return new Response(
        JSON.stringify({ error: "Failed to sync subscription" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Record payment
    const amountCents = isDemo
      ? tier === "starter"
        ? 3499
        : 11999
      : 0; // Real amount would come from Google

    await adminClient.from("payments").insert({
      user_id: user.id,
      amount_cents: amountCents,
      currency: "USD",
      status: "settled",
      metadata: {
        source: "google_play",
        demo: isDemo,
        order_id: verification.orderId,
        product_id: productId,
        purchase_token: purchaseToken.slice(0, 20) + "…",
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        demo: isDemo,
        tier,
        billing_cycle: billingCycle,
        period_end: periodEnd,
        order_id: verification.orderId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("google-play-verify error:", err);
    return new Response(
      JSON.stringify({ error: err.message ?? "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
