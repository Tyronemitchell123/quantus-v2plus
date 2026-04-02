-- Recreate view with SECURITY INVOKER
CREATE OR REPLACE VIEW public.vendors_safe
WITH (security_invoker = true) AS
SELECT
  id, name, company, category, description, location,
  specialties, tier, logo_url, is_active, is_verified,
  created_at, updated_at
FROM public.vendors
WHERE is_active = true;