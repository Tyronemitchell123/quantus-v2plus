import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface OnboardingStatus {
  completed: boolean;
  completedAt: string | null;
  role: string | null;
  modules: string[] | null;
  tier: string | null;
  preferences: Record<string, string> | null;
  loading: boolean;
}

export function useOnboardingStatus(userId: string | undefined) {
  const [status, setStatus] = useState<OnboardingStatus>({
    completed: false,
    completedAt: null,
    role: null,
    modules: null,
    tier: null,
    preferences: null,
    loading: true,
  });

  useEffect(() => {
    if (!userId) {
      setStatus((s) => ({ ...s, loading: false }));
      return;
    }

    let mounted = true;

    const fetch = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("onboarding_completed_at, onboarding_role, onboarding_modules, onboarding_tier, onboarding_preferences")
        .eq("user_id", userId)
        .maybeSingle();

      if (!mounted) return;

      if (error || !data) {
        setStatus((s) => ({ ...s, loading: false }));
        return;
      }

      setStatus({
        completed: !!data.onboarding_completed_at,
        completedAt: data.onboarding_completed_at,
        role: data.onboarding_role,
        modules: data.onboarding_modules,
        tier: data.onboarding_tier,
        preferences: data.onboarding_preferences as Record<string, string> | null,
        loading: false,
      });
    };

    fetch();
    return () => { mounted = false; };
  }, [userId]);

  return status;
}
