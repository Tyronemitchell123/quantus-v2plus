
-- Vanguard client profiles
CREATE TABLE public.vanguard_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_name TEXT NOT NULL,
  client_code TEXT NOT NULL DEFAULT 'VGD-' || upper(substr(gen_random_uuid()::text, 1, 6)),
  wearable_provider TEXT NOT NULL DEFAULT 'oura',
  wearable_api_token TEXT,
  calendar_provider TEXT DEFAULT 'google',
  retainer_cents BIGINT NOT NULL DEFAULT 2000000,
  success_fee_rate NUMERIC NOT NULL DEFAULT 0.05,
  preferred_airports TEXT[] DEFAULT '{FAB,TEB}',
  preferred_destinations TEXT[] DEFAULT '{NRT,BKK,ZRH}',
  bio_recovery_threshold INTEGER NOT NULL DEFAULT 40,
  stress_index_threshold INTEGER NOT NULL DEFAULT 8,
  consecutive_days INTEGER NOT NULL DEFAULT 3,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vanguard_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own vanguard clients"
  ON public.vanguard_clients FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all vanguard clients"
  ON public.vanguard_clients FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Vanguard bio-recovery triggers
CREATE TABLE public.vanguard_triggers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.vanguard_clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  recovery_scores INTEGER[] NOT NULL DEFAULT '{}',
  calendar_stress_index INTEGER NOT NULL DEFAULT 0,
  trigger_type TEXT NOT NULL DEFAULT 'bio_recovery',
  escape_manifest JSONB DEFAULT '{}',
  outreach_draft TEXT,
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'detected',
  commission_cents BIGINT DEFAULT 0,
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vanguard_triggers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own vanguard triggers"
  ON public.vanguard_triggers FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all vanguard triggers"
  ON public.vanguard_triggers FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Timestamp triggers
CREATE TRIGGER update_vanguard_clients_updated_at
  BEFORE UPDATE ON public.vanguard_clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vanguard_triggers_updated_at
  BEFORE UPDATE ON public.vanguard_triggers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
