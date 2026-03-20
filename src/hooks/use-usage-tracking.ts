import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export type TierKey = "free" | "starter" | "professional" | "enterprise";

const QUERY_LIMITS: Record<TierKey, number> = {
  free: 100,
  starter: 5000,
  professional: Infinity,
  enterprise: Infinity,
};

export function useUsageTracking() {
  const { user } = useAuth();
  const [used, setUsed] = useState(0);
  const [tier, setTier] = useState<TierKey>("free");
  const [loading, setLoading] = useState(true);

  const limit = QUERY_LIMITS[tier];
  const remaining = Math.max(0, limit - used);
  const percentage = limit === Infinity ? 0 : Math.round((used / limit) * 100);
  const isNearLimit = limit !== Infinity && percentage >= 80;
  const isAtLimit = limit !== Infinity && used >= limit;

  const fetchUsage = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Get current tier
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("tier")
      .eq("user_id", user.id)
      .maybeSingle();

    if (sub?.tier) setTier(sub.tier as TierKey);

    // Get this month's usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: records } = await supabase
      .from("usage_records")
      .select("quantity")
      .eq("user_id", user.id)
      .eq("feature", "ai_query")
      .gte("recorded_at", startOfMonth.toISOString());

    const total = records?.reduce((sum, r) => sum + r.quantity, 0) ?? 0;
    setUsed(total);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const trackQuery = useCallback(async () => {
    if (!user) return false;
    if (isAtLimit) return false;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const res = await fetch(
      `https://${projectId}.supabase.co/functions/v1/track-usage`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ feature: "ai_query", quantity: 1 }),
      }
    );

    if (res.ok) {
      setUsed((prev) => prev + 1);
      return true;
    }
    return false;
  }, [user, isAtLimit]);

  return {
    used,
    limit,
    remaining,
    percentage,
    isNearLimit,
    isAtLimit,
    tier,
    loading,
    trackQuery,
    refresh: fetchUsage,
  };
}
