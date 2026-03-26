
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_role TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_preferences JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS onboarding_modules TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS onboarding_tier TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;
