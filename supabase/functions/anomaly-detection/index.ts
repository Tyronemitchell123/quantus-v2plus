import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface UsageStats {
  user_id: string;
  total: number;
  daily_avg: number;
  max_day: number;
  today: number;
  feature: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Authenticate the calling user
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
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

    // Use verified user ID — ignore any caller-supplied user_id
    const targetUserId = user.id;
    const supabase = createClient(supabaseUrl, serviceKey);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // Fetch recent usage records
    let query = supabase
      .from("usage_records")
      .select("user_id, feature, quantity, recorded_at")
      .gte("recorded_at", thirtyDaysAgo.toISOString())
      .order("recorded_at", { ascending: false });

    if (targetUserId) {
      query = query.eq("user_id", targetUserId);
    }

    const { data: records, error: fetchError } = await query.limit(5000);
    if (fetchError) throw fetchError;
    if (!records || records.length === 0) {
      return new Response(
        JSON.stringify({ alerts_created: 0, message: "No usage data to analyze" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Group by user+feature and compute stats
    const statsMap = new Map<string, UsageStats>();

    for (const r of records) {
      const key = `${r.user_id}::${r.feature}`;
      if (!statsMap.has(key)) {
        statsMap.set(key, {
          user_id: r.user_id,
          feature: r.feature,
          total: 0,
          daily_avg: 0,
          max_day: 0,
          today: 0,
        });
      }
      const s = statsMap.get(key)!;
      s.total += r.quantity;

      const recordDate = new Date(r.recorded_at);
      if (recordDate >= todayStart) {
        s.today += r.quantity;
      }
    }

    // Compute daily averages and per-day max
    const dayBuckets = new Map<string, Map<string, number>>(); // key -> dateStr -> qty
    for (const r of records) {
      const key = `${r.user_id}::${r.feature}`;
      const dateStr = r.recorded_at.slice(0, 10);
      if (!dayBuckets.has(key)) dayBuckets.set(key, new Map());
      const bucket = dayBuckets.get(key)!;
      bucket.set(dateStr, (bucket.get(dateStr) ?? 0) + r.quantity);
    }

    for (const [key, bucket] of dayBuckets) {
      const s = statsMap.get(key)!;
      const values = Array.from(bucket.values());
      s.daily_avg = values.reduce((a, b) => a + b, 0) / Math.max(values.length, 1);
      s.max_day = Math.max(...values);
    }

    // Anomaly detection rules
    const alertsToCreate: Array<{
      user_id: string;
      title: string;
      description: string;
      severity: string;
      metric_name: string;
      metric_value: number;
      threshold: number;
    }> = [];

    for (const [, stats] of statsMap) {
      const { user_id, feature, daily_avg, today, max_day, total } = stats;

      // Rule 1: Today's usage is >2x the daily average (spike detection)
      if (daily_avg > 0 && today > daily_avg * 2 && today > 5) {
        alertsToCreate.push({
          user_id,
          title: `Usage spike detected: ${feature}`,
          description: `Today's ${feature} usage (${today}) is ${(today / daily_avg).toFixed(1)}x above your 30-day daily average (${Math.round(daily_avg)}).`,
          severity: today > daily_avg * 4 ? "critical" : "warning",
          metric_name: `${feature}_daily`,
          metric_value: today,
          threshold: Math.round(daily_avg * 2),
        });
      }

      // Rule 2: Approaching monthly limit thresholds
      const monthlyLimits: Record<string, number> = {
        ai_query: 100, // free tier limit
      };
      const limit = monthlyLimits[feature];
      if (limit && total >= limit * 0.8 && total < limit) {
        alertsToCreate.push({
          user_id,
          title: `Approaching ${feature} limit`,
          description: `You've used ${total} of ${limit} ${feature} requests this month (${Math.round((total / limit) * 100)}%). Consider upgrading your plan.`,
          severity: total >= limit * 0.95 ? "critical" : "warning",
          metric_name: `${feature}_monthly`,
          metric_value: total,
          threshold: limit,
        });
      }

      // Rule 3: Limit exceeded
      if (limit && total >= limit) {
        alertsToCreate.push({
          user_id,
          title: `${feature} limit reached`,
          description: `You've exhausted your monthly ${feature} allowance (${total}/${limit}). Upgrade to continue using this feature.`,
          severity: "critical",
          metric_name: `${feature}_monthly`,
          metric_value: total,
          threshold: limit,
        });
      }

      // Rule 4: Unusual inactivity (had usage before but none today, and avg > 5)
      if (daily_avg > 5 && today === 0 && max_day > 0) {
        alertsToCreate.push({
          user_id,
          title: `Unusual inactivity: ${feature}`,
          description: `No ${feature} activity today, but your average is ${Math.round(daily_avg)}/day. This could indicate an integration issue.`,
          severity: "info",
          metric_name: `${feature}_daily`,
          metric_value: 0,
          threshold: Math.round(daily_avg),
        });
      }

      // Rule 5: Quantum job spike detection
      if (feature === "quantum_job" && daily_avg > 0 && today > daily_avg * 2 && today > 3) {
        alertsToCreate.push({
          user_id,
          title: `Quantum job submission spike`,
          description: `Today's quantum job submissions (${today}) are ${(today / daily_avg).toFixed(1)}x above your daily average (${Math.round(daily_avg)}).`,
          severity: today > daily_avg * 4 ? "critical" : "warning",
          metric_name: "quantum_job_daily",
          metric_value: today,
          threshold: Math.round(daily_avg * 2),
        });
      }
    }

    // Deduplicate: don't create alerts that already exist today
    const existingAlerts = await supabase
      .from("anomaly_alerts")
      .select("user_id, title")
      .gte("created_at", todayStart.toISOString());

    const existingSet = new Set(
      (existingAlerts.data ?? []).map((a: any) => `${a.user_id}::${a.title}`)
    );

    const newAlerts = alertsToCreate.filter(
      (a) => !existingSet.has(`${a.user_id}::${a.title}`)
    );

    if (newAlerts.length > 0) {
      const { error: insertError } = await supabase
        .from("anomaly_alerts")
        .insert(newAlerts);
      if (insertError) throw insertError;
    }

    return new Response(
      JSON.stringify({
        alerts_created: newAlerts.length,
        alerts_skipped: alertsToCreate.length - newAlerts.length,
        users_analyzed: new Set(Array.from(statsMap.values()).map((s) => s.user_id)).size,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("anomaly-detection error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
