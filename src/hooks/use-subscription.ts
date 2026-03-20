import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SubscriptionTier = "free" | "starter" | "professional" | "teams" | "enterprise";
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing" | "inactive";

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  billing_cycle: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

const TIER_LIMITS: Record<SubscriptionTier, { queries: number; integrations: number }> = {
  free: { queries: 100, integrations: 1 },
  starter: { queries: 5000, integrations: 2 },
  professional: { queries: Infinity, integrations: 25 },
  teams: { queries: Infinity, integrations: 50 },
  enterprise: { queries: Infinity, integrations: Infinity },
};

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => authSub.unsubscribe();
  }, []);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    setSubscription(data as Subscription | null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const isActive = subscription?.status === "active" || subscription?.status === "trialing";
  const tier = subscription?.tier ?? "free";
  const limits = TIER_LIMITS[tier];

  const canAccess = (requiredTier: SubscriptionTier): boolean => {
    if (requiredTier === "free") return true;
    if (!isActive) return false;
    const tierOrder: SubscriptionTier[] = ["free", "starter", "professional", "teams", "enterprise"];
    return tierOrder.indexOf(tier) >= tierOrder.indexOf(requiredTier);
  };

  const createPayment = async (selectedTier: SubscriptionTier, billingCycle: "monthly" | "annual", seats?: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/truelayer-payments?action=create-payment`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ tier: selectedTier, billing_cycle: billingCycle, seats: selectedTier === "teams" ? (seats || 1) : 1 }),
      }
    );

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Payment failed");

    await fetchSubscription();
    return result;
  };

  return {
    subscription,
    loading,
    isActive,
    tier,
    limits,
    canAccess,
    createPayment,
    refresh: fetchSubscription,
    user,
  };
}
