import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { rateLimit } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const rateLimited = rateLimit(req, corsHeaders);
    if (rateLimited) return rateLimited;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify user identity
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch addon sales
    const { data: addonSales } = await admin
      .from("addon_purchases")
      .select("id, user_id, addon_id, quantity, amount_cents, status, created_at, addons(name, category)")
      .order("created_at", { ascending: false })
      .limit(200);

    // Addon summary
    const totalAddonRevenue = (addonSales || []).reduce((s, p) => s + (p.amount_cents || 0), 0);
    const activeAddonCount = (addonSales || []).filter(p => p.status === "active").length;

    // Fetch referral codes with usage
    const { data: referralCodes } = await admin
      .from("referral_codes")
      .select("id, user_id, code, reward_credits, uses_count, max_uses, is_active, created_at")
      .order("created_at", { ascending: false })
      .limit(200);

    // Fetch referral redemptions
    const { data: redemptions } = await admin
      .from("referral_redemptions")
      .select("id, referrer_id, referred_id, credits_awarded, status, created_at")
      .order("created_at", { ascending: false })
      .limit(200);

    const totalCreditsAwarded = (redemptions || []).reduce((s, r) => s + (r.credits_awarded || 0), 0);

    // Fetch overage records
    const { data: overages } = await admin
      .from("usage_overages")
      .select("id, user_id, feature, overage_quantity, rate_cents, total_cents, status, billing_period_start, billing_period_end, created_at")
      .order("created_at", { ascending: false })
      .limit(200);

    const totalOverageRevenue = (overages || []).reduce((s, o) => s + (o.total_cents || 0), 0);
    const pendingOverages = (overages || []).filter(o => o.status === "pending").length;

    return new Response(JSON.stringify({
      addonSales: {
        records: addonSales || [],
        totalRevenue: totalAddonRevenue,
        activeCount: activeAddonCount,
        totalSales: (addonSales || []).length,
      },
      referrals: {
        codes: referralCodes || [],
        redemptions: redemptions || [],
        totalCodes: (referralCodes || []).length,
        totalRedemptions: (redemptions || []).length,
        totalCreditsAwarded,
      },
      overages: {
        records: overages || [],
        totalRevenue: totalOverageRevenue,
        pendingCount: pendingOverages,
        totalRecords: (overages || []).length,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
