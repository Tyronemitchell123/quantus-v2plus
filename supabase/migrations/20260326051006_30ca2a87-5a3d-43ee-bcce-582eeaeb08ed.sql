
CREATE TYPE public.deal_category AS ENUM (
  'aviation', 'medical', 'staffing', 'lifestyle', 'logistics', 'partnerships'
);

CREATE TYPE public.deal_status AS ENUM (
  'intake', 'sourcing', 'matching', 'negotiation', 'execution', 'completed', 'cancelled'
);

CREATE TABLE public.deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  deal_number text NOT NULL DEFAULT ('QAI-' || upper(substr(gen_random_uuid()::text, 1, 8))),
  raw_input text NOT NULL,
  input_channel text NOT NULL DEFAULT 'web',
  category deal_category NOT NULL,
  sub_category text,
  intent text,
  budget_min numeric,
  budget_max numeric,
  budget_currency text DEFAULT 'USD',
  timeline_days integer,
  location text,
  constraints jsonb DEFAULT '[]'::jsonb,
  preferences jsonb DEFAULT '[]'::jsonb,
  requirements jsonb DEFAULT '{}'::jsonb,
  priority_score integer NOT NULL DEFAULT 50,
  deal_value_estimate numeric,
  complexity_score integer DEFAULT 50,
  urgency_score integer DEFAULT 50,
  probability_score integer DEFAULT 50,
  status deal_status NOT NULL DEFAULT 'intake',
  routed_engine text,
  ai_confirmation text,
  ai_classification_raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own deals" ON public.deals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own deals" ON public.deals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own deals" ON public.deals FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all deals" ON public.deals FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.deals;
