import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Progressive profiling: tracks which onboarding steps are done
 * and allows resuming from where the user left off.
 * Data is persisted to localStorage + profiles table.
 */

const STORAGE_KEY = "quantus_onboarding_progress";

interface ProgressiveState {
  lastCompletedStep: number;
  role: string | null;
  preferences: Record<string, string>;
  modules: string[];
  tier: string | null;
  verificationData: { fullName?: string; billingEmail?: string; company?: string };
}

const defaultState: ProgressiveState = {
  lastCompletedStep: -1,
  role: null,
  preferences: {},
  modules: [],
  tier: null,
  verificationData: {},
};

export function useProgressiveProfile(userId: string | undefined) {
  const [state, setState] = useState<ProgressiveState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...defaultState, ...JSON.parse(stored) } : defaultState;
    } catch {
      return defaultState;
    }
  });

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Sync partial progress to DB every time a step completes
  const saveStepProgress = useCallback(
    async (step: number, partial: Partial<ProgressiveState>) => {
      const next = { ...state, ...partial, lastCompletedStep: Math.max(state.lastCompletedStep, step) };
      setState(next);

      if (userId) {
        await supabase
          .from("profiles")
          .update({
            onboarding_role: next.role,
            onboarding_preferences: next.preferences,
            onboarding_modules: next.modules,
            onboarding_tier: next.tier,
          } as any)
          .eq("user_id", userId);
      }
    },
    [state, userId],
  );

  const getResumeStep = useCallback(() => {
    // Resume from the step after the last completed one
    return Math.min(state.lastCompletedStep + 1, 6);
  }, [state.lastCompletedStep]);

  const clearProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(defaultState);
  }, []);

  return { state, saveStepProgress, getResumeStep, clearProgress };
}
