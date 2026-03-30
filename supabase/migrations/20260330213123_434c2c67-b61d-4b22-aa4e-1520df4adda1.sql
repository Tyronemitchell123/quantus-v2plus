-- Remove the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can view products" ON public.stripe_connect_products;

-- Create a view that exposes only storefront-safe columns (no internal Stripe IDs)
CREATE OR REPLACE VIEW public.storefront_products AS
SELECT
  id,
  name,
  description,
  price_cents,
  currency,
  created_at
FROM public.stripe_connect_products;

-- Re-add a restricted SELECT policy: only authenticated users can read raw table
CREATE POLICY "Authenticated users can view products"
ON public.stripe_connect_products
FOR SELECT
TO authenticated
USING (true);