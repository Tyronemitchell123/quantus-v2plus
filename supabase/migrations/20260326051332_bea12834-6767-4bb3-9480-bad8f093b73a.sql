
CREATE TABLE public.sourcing_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  category text NOT NULL,
  tier text NOT NULL DEFAULT 'primary',
  name text NOT NULL,
  description text,
  overall_score integer NOT NULL DEFAULT 0,
  score_breakdown jsonb DEFAULT '{}'::jsonb,
  pros jsonb DEFAULT '[]'::jsonb,
  cons jsonb DEFAULT '[]'::jsonb,
  risk_level text DEFAULT 'low',
  estimated_cost numeric,
  cost_currency text DEFAULT 'USD',
  availability text,
  location text,
  specifications jsonb DEFAULT '{}'::jsonb,
  vendor_contact jsonb DEFAULT '{}'::jsonb,
  vendor_prep jsonb DEFAULT '{}'::jsonb,
  recommended_next_step text,
  ai_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sourcing_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sourcing results" ON public.sourcing_results FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sourcing results" ON public.sourcing_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all sourcing results" ON public.sourcing_results FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_sourcing_results_deal ON public.sourcing_results(deal_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.sourcing_results;
