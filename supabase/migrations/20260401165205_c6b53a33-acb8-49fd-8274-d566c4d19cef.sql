-- Pilot tenants table for client isolation
CREATE TABLE public.pilot_tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tenant_code TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  sector TEXT NOT NULL DEFAULT 'aviation',
  config JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pilot_tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pilot tenants"
  ON public.pilot_tenants FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all pilot tenants"
  ON public.pilot_tenants FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create own pilot tenants"
  ON public.pilot_tenants FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pilot tenants"
  ON public.pilot_tenants FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_pilot_tenants_updated_at
  BEFORE UPDATE ON public.pilot_tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Arbitrage results table
CREATE TABLE public.pilot_arbitrage_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.pilot_tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  route_origin TEXT NOT NULL,
  route_destination TEXT NOT NULL,
  aircraft_type TEXT,
  tail_number TEXT,
  internal_price_cents BIGINT NOT NULL DEFAULT 0,
  competitor_price_cents BIGINT NOT NULL DEFAULT 0,
  competitor_source TEXT,
  delta_pct NUMERIC DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_perishing BOOLEAN DEFAULT false,
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pilot_arbitrage_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own arbitrage results"
  ON public.pilot_arbitrage_results FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own arbitrage results"
  ON public.pilot_arbitrage_results FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access arbitrage"
  ON public.pilot_arbitrage_results FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Outreach drafts table
CREATE TABLE public.pilot_outreach_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.pilot_tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  lead_name TEXT NOT NULL,
  tail_number TEXT,
  savings_amount_cents BIGINT DEFAULT 0,
  draft_message TEXT NOT NULL,
  tone TEXT DEFAULT 'formal',
  status TEXT NOT NULL DEFAULT 'draft',
  approved_at TIMESTAMP WITH TIME ZONE,
  sent_via TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pilot_outreach_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own outreach drafts"
  ON public.pilot_outreach_drafts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own outreach drafts"
  ON public.pilot_outreach_drafts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own outreach drafts"
  ON public.pilot_outreach_drafts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access drafts"
  ON public.pilot_outreach_drafts FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER update_pilot_outreach_drafts_updated_at
  BEFORE UPDATE ON public.pilot_outreach_drafts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();