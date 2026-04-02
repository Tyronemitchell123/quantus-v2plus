-- Drop the overly broad SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view active vendors" ON public.vendors;

-- Add scoped SELECT: users can only see vendors they have outreach with
CREATE POLICY "Users can view vendors via outreach"
ON public.vendors
FOR SELECT
TO authenticated
USING (
  is_active = true
  AND EXISTS (
    SELECT 1 FROM public.vendor_outreach vo
    WHERE vo.vendor_name = vendors.name
      AND vo.user_id = auth.uid()
  )
);

-- Create a safe view excluding sensitive fields for general listings
CREATE OR REPLACE VIEW public.vendors_safe AS
SELECT
  id, name, company, category, description, location,
  specialties, tier, logo_url, is_active, is_verified,
  created_at, updated_at
FROM public.vendors
WHERE is_active = true;