
CREATE TABLE public.stripe_connected_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  stripe_account_id text NOT NULL UNIQUE,
  display_name text,
  contact_email text,
  onboarding_complete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.stripe_connect_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_product_id text NOT NULL UNIQUE,
  stripe_price_id text,
  connected_account_id text NOT NULL,
  name text NOT NULL,
  description text,
  price_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stripe_connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_connect_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own connected account"
  ON public.stripe_connected_accounts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connected account"
  ON public.stripe_connected_accounts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connected account"
  ON public.stripe_connected_accounts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Service role full access connected accounts"
  ON public.stripe_connected_accounts FOR ALL
  TO public USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Anyone can view products"
  ON public.stripe_connect_products FOR SELECT
  TO public USING (true);

CREATE POLICY "Service role full access products"
  ON public.stripe_connect_products FOR ALL
  TO public USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER update_stripe_connected_accounts_updated_at
  BEFORE UPDATE ON public.stripe_connected_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
