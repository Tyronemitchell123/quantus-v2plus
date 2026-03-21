
-- ===========================================
-- 1. Add-on Marketplace
-- ===========================================
CREATE TABLE public.addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'credits',
  price_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'GBP',
  billing_type text NOT NULL DEFAULT 'one_time', -- one_time, recurring
  features jsonb DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active addons"
  ON public.addons FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage addons"
  ON public.addons FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Addon purchases
CREATE TABLE public.addon_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  addon_id uuid NOT NULL REFERENCES public.addons(id),
  quantity integer NOT NULL DEFAULT 1,
  amount_cents integer NOT NULL,
  status text NOT NULL DEFAULT 'active',
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.addon_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own addon purchases"
  ON public.addon_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own addon purchases"
  ON public.addon_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ===========================================
-- 2. Referral Program
-- ===========================================
CREATE TABLE public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  code text NOT NULL UNIQUE,
  reward_credits integer NOT NULL DEFAULT 500,
  max_uses integer DEFAULT NULL,
  uses_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referral codes"
  ON public.referral_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own referral codes"
  ON public.referral_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.referral_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id uuid NOT NULL REFERENCES public.referral_codes(id),
  referrer_id uuid NOT NULL,
  referred_id uuid NOT NULL,
  credits_awarded integer NOT NULL DEFAULT 500,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(referral_code_id, referred_id)
);

ALTER TABLE public.referral_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their referral redemptions"
  ON public.referral_redemptions FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- ===========================================
-- 3. Usage Overage Tracking
-- ===========================================
CREATE TABLE public.usage_overages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  feature text NOT NULL,
  overage_quantity integer NOT NULL,
  rate_cents integer NOT NULL,
  total_cents integer NOT NULL,
  billing_period_start timestamptz NOT NULL,
  billing_period_end timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending, billed, paid
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.usage_overages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own overages"
  ON public.usage_overages FOR SELECT
  USING (auth.uid() = user_id);

-- ===========================================
-- 4. User Credits (for referrals, add-ons, etc.)
-- ===========================================
CREATE TABLE public.user_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  balance integer NOT NULL DEFAULT 0,
  lifetime_earned integer NOT NULL DEFAULT 0,
  lifetime_spent integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own credits"
  ON public.user_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits"
  ON public.user_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
  ON public.user_credits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TABLE public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  type text NOT NULL, -- referral_reward, referral_bonus, addon_purchase, overage_credit, manual
  description text,
  reference_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own credit transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credit transactions"
  ON public.credit_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ===========================================
-- 5. Seed Add-on Products
-- ===========================================
INSERT INTO public.addons (name, description, category, price_cents, billing_type, features, sort_order) VALUES
  ('Extra AI Credits Pack', '5,000 additional AI queries for your account', 'credits', 1499, 'one_time', '["5,000 AI queries", "No expiry", "Stackable"]'::jsonb, 1),
  ('Quantum Boost Pack', '100 additional quantum computing jobs', 'credits', 2999, 'one_time', '["100 quantum jobs", "All QPU devices", "Priority queue"]'::jsonb, 2),
  ('Priority Support', '24/7 priority support with 1-hour response SLA', 'support', 4999, 'recurring', '["1-hour response SLA", "Direct Slack channel", "Dedicated engineer"]'::jsonb, 3),
  ('Custom AI Model Training', 'Train custom models on your proprietary data', 'premium', 29999, 'recurring', '["Custom fine-tuning", "Private model hosting", "Monthly retraining", "API endpoint"]'::jsonb, 4),
  ('White-Label API Access', 'Remove QUANTUS branding and serve via your domain', 'premium', 19999, 'recurring', '["Custom branding", "Your domain", "White-label docs", "Custom rate limits"]'::jsonb, 5),
  ('Advanced Analytics Suite', 'Deep-dive analytics with predictive modeling', 'analytics', 7999, 'recurring', '["Predictive forecasts", "Custom dashboards", "Data warehouse export", "Real-time alerts"]'::jsonb, 6),
  ('Compliance & Audit Pack', 'SOC 2, GDPR compliance tools and audit trails', 'compliance', 9999, 'recurring', '["SOC 2 reports", "GDPR toolkit", "Data residency controls", "Audit exports"]'::jsonb, 7),
  ('GPU Accelerator Credits', '50 hours of GPU-accelerated processing', 'credits', 4999, 'one_time', '["50 GPU hours", "A100 instances", "Parallel processing", "No expiry"]'::jsonb, 8);

-- ===========================================
-- 6. Overage rate config
-- ===========================================
INSERT INTO public.addons (name, description, category, price_cents, billing_type, features, sort_order) VALUES
  ('AI Query Overage', 'Auto-billed when exceeding plan limits', 'overage', 30, 'one_time', '["Per extra query", "Auto-charged monthly"]'::jsonb, 100),
  ('Quantum Job Overage', 'Auto-billed when exceeding plan limits', 'overage', 500, 'one_time', '["Per extra job", "Auto-charged monthly"]'::jsonb, 101);
