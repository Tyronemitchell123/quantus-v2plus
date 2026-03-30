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

// Stripe price IDs for each tier
export const STRIPE_TIERS = {
  starter: {
    price_id: "price_1TDDnJLHlfS2sSjxih5YxUbI",
    annual_price_id: "price_1TGomnLwCkGlk8CPSo2YqcYb",
    product_id: "prod_UBaz9IvwQ3JGPQ",
  },
  professional: {
    price_id: "price_1TDDnaLHlfS2sSjxeGv5mMKR",
    annual_price_id: "price_1TGonKLwCkGlk8CP7oG8wtiN",
    product_id: "prod_UBazsHedGjIiur",
  },
  teams: {
    price_id: "price_1TDDoJLHlfS2sSjxqj0bGYaa",
    annual_price_id: "price_1TGopJLwCkGlk8CPfJ7ltvjs",
    product_id: "prod_UBb0bxM7kcxShs",
  },
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

    try {
      // Check Stripe subscription status
      const { data, error } = await supabase.functions.invoke("check-subscription");

      if (error) {
        console.error("check-subscription error:", error);
        // Fallback to DB
        const { data: dbData } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        setSubscription(dbData as Subscription | null);
      } else if (data?.subscribed) {
        setSubscription({
          id: "stripe",
          user_id: user.id,
          tier: (data.tier as SubscriptionTier) || "starter",
          status: (data.status as SubscriptionStatus) || "active",
          billing_cycle: "monthly",
          current_period_start: null,
          current_period_end: data.subscription_end || null,
          cancel_at_period_end: data.cancel_at_period_end || false,
        });
      } else {
        // No Stripe subscription — check DB for free tier
        const { data: dbData } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        setSubscription(dbData as Subscription | null);
      }
    } catch (err) {
      console.error("Subscription check failed:", err);
      const { data: dbData } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      setSubscription(dbData as Subscription | null);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Auto-refresh every 60s
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, fetchSubscription]);

  const isActive = subscription?.status === "active" || subscription?.status === "trialing";
  const tier = subscription?.tier ?? "free";
  const limits = TIER_LIMITS[tier];

  const canAccess = (requiredTier: SubscriptionTier): boolean => {
    if (requiredTier === "free") return true;
    if (!isActive) return false;
    const tierOrder: SubscriptionTier[] = ["free", "starter", "professional", "teams", "enterprise"];
    return tierOrder.indexOf(tier) >= tierOrder.indexOf(requiredTier);
  };

  const createCheckout = async (selectedTier: SubscriptionTier, seats?: number, billingCycle?: "monthly" | "annual") => {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { tier: selectedTier, seats, billing_cycle: billingCycle || "monthly" },
    });

    if (error) throw new Error(error.message || "Checkout failed");
    if (data?.error) throw new Error(data.error);
    if (data?.url) {
      window.location.href = data.url;
    }
    return data;
  };

  const openCustomerPortal = async () => {
    const { data, error } = await supabase.functions.invoke("customer-portal");
    if (error) throw new Error(error.message || "Portal failed");
    if (data?.error) throw new Error(data.error);
    if (data?.url) {
      window.location.href = data.url;
    }
    return data;
  };

  // Keep backward compat
  const createPayment = async (selectedTier: SubscriptionTier, _billingCycle: "monthly" | "annual", seats?: number) => {
    return createCheckout(selectedTier, seats);
  };

  return {
    subscription,
    loading,
    isActive,
    tier,
    limits,
    canAccess,
    createPayment,
    createCheckout,
    openCustomerPortal,
    refresh: fetchSubscription,
    user,
  };
}
