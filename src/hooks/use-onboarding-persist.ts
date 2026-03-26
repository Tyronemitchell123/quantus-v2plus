import { supabase } from "@/integrations/supabase/client";

interface OnboardingData {
  role: string | null;
  preferences: Record<string, string>;
  modules: string[];
  tier: string | null;
}

export async function persistOnboarding(userId: string, data: OnboardingData) {
  const { error } = await supabase
    .from("profiles")
    .update({
      onboarding_role: data.role,
      onboarding_preferences: data.preferences,
      onboarding_modules: data.modules,
      onboarding_tier: data.tier,
      onboarding_completed_at: new Date().toISOString(),
    } as any)
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to persist onboarding:", error);
  }
  return { error };
}
