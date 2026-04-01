
-- Tenants table
CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  sector text NOT NULL CHECK (sector IN ('Aviation', 'Medical', 'Lifestyle', 'Hospitality')),
  status text NOT NULL DEFAULT 'Trial' CHECK (status IN ('Active', 'Trial')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tenants" ON public.tenants FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tenants" ON public.tenants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tenants" ON public.tenants FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all tenants" ON public.tenants FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Leads table
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  source_url text,
  status text NOT NULL DEFAULT 'Monitoring' CHECK (status IN ('Monitoring', 'Ghosted', 'Recovered')),
  potential_value numeric NOT NULL DEFAULT 0,
  ai_summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own leads" ON public.leads FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own leads" ON public.leads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own leads" ON public.leads FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all leads" ON public.leads FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Commissions table
CREATE TABLE public.commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  total_value numeric NOT NULL DEFAULT 0,
  quantus_cut numeric NOT NULL DEFAULT 0,
  payout_status text NOT NULL DEFAULT 'Pending' CHECK (payout_status IN ('Pending', 'Paid')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own commissions" ON public.commissions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own commissions" ON public.commissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own commissions" ON public.commissions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all commissions" ON public.commissions FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_commissions_updated_at BEFORE UPDATE ON public.commissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- System logs table
CREATE TABLE public.system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  action_type text NOT NULL CHECK (action_type IN ('Scrape', 'Negotiation', 'Alert', 'Recovery')),
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logs" ON public.system_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own logs" ON public.system_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all logs" ON public.system_logs FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
