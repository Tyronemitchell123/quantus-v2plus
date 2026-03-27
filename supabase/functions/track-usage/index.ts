import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { rateLimit } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rateLimited = rateLimit(req, corsHeaders);
    if (rateLimited) return rateLimited;

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

    // Verify user
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { feature, quantity } = await req.json();

    // Validate input
    const allowedFeatures = ["ai_query", "quantum_job", "api_call"];
    if (!feature || !allowedFeatures.includes(feature)) {
      return new Response(
        JSON.stringify({ error: "Invalid feature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const qty = Math.min(Math.max(Number(quantity) || 1, 1), 100);

    // Check tier limits before recording
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: sub } = await adminClient
      .from("subscriptions")
      .select("tier")
      .eq("user_id", user.id)
      .maybeSingle();

    const tierLimits: Record<string, Record<string, number>> = {
      free: { ai_query: 100, quantum_job: 10, api_call: 1000 },
      starter: { ai_query: 5000, quantum_job: 50, api_call: 10000 },
      professional: { ai_query: Infinity, quantum_job: Infinity, api_call: Infinity },
      enterprise: { ai_query: Infinity, quantum_job: Infinity, api_call: Infinity },
    };

    const tier = sub?.tier ?? "free";
    const limit = tierLimits[tier]?.[feature] ?? 0;

    if (limit !== Infinity) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: records } = await adminClient
        .from("usage_records")
        .select("quantity")
        .eq("user_id", user.id)
        .eq("feature", feature)
        .gte("recorded_at", startOfMonth.toISOString());

      const currentUsage = records?.reduce((s, r) => s + r.quantity, 0) ?? 0;
      if (currentUsage + qty > limit) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached", used: currentUsage, limit }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Insert via service role (bypasses RLS)
    const { error: insertError } = await adminClient.from("usage_records").insert({
      user_id: user.id,
      feature,
      quantity: qty,
    });

    if (insertError) {
      return new Response(
        JSON.stringify({ error: "Failed to record usage" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message ?? "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
