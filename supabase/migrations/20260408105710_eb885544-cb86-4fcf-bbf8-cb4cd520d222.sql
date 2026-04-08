
-- OTP codes for 2FA
CREATE TABLE public.otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  code text NOT NULL,
  purpose text NOT NULL DEFAULT 'high_value_action',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages OTP codes"
  ON public.otp_codes FOR ALL
  USING (auth.role() = 'service_role'::text)
  WITH CHECK (auth.role() = 'service_role'::text);

CREATE POLICY "Users can view own OTP codes"
  ON public.otp_codes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_otp_codes_user_purpose ON public.otp_codes (user_id, purpose, verified);

-- Deal share tokens for public tracking
CREATE TABLE public.deal_share_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.deal_share_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages share tokens"
  ON public.deal_share_tokens FOR ALL
  USING (auth.role() = 'service_role'::text)
  WITH CHECK (auth.role() = 'service_role'::text);

CREATE POLICY "Users can manage own share tokens"
  ON public.deal_share_tokens FOR ALL
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Public can read active tokens"
  ON public.deal_share_tokens FOR SELECT
  TO anon
  USING (is_active = true AND expires_at > now());

CREATE INDEX idx_deal_share_token ON public.deal_share_tokens (token);

-- Email events tracking
CREATE TABLE public.email_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_log_id uuid REFERENCES public.email_send_log(id) ON DELETE SET NULL,
  event_type text NOT NULL DEFAULT 'open',
  metadata jsonb DEFAULT '{}'::jsonb,
  user_agent text,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages email events"
  ON public.email_events FOR ALL
  USING (auth.role() = 'service_role'::text)
  WITH CHECK (auth.role() = 'service_role'::text);

CREATE POLICY "Admins can view email events"
  ON public.email_events FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_email_events_log ON public.email_events (email_log_id);

-- Deal templates
CREATE TABLE public.deal_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'luxury',
  description text,
  icon text DEFAULT 'Briefcase',
  default_raw_input text NOT NULL DEFAULT '',
  default_requirements jsonb DEFAULT '{}'::jsonb,
  default_preferences jsonb DEFAULT '[]'::jsonb,
  default_budget_min numeric,
  default_budget_max numeric,
  default_budget_currency text DEFAULT 'GBP',
  default_timeline_days integer,
  default_location text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.deal_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage deal templates"
  ON public.deal_templates FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view active templates"
  ON public.deal_templates FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE TRIGGER update_deal_templates_updated_at
  BEFORE UPDATE ON public.deal_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
