-- Add vendor_id FK column to vendor_outreach
ALTER TABLE public.vendor_outreach
ADD COLUMN vendor_id uuid REFERENCES public.vendors(id) ON DELETE SET NULL;

-- Backfill vendor_id from vendor_name where possible
UPDATE public.vendor_outreach vo
SET vendor_id = v.id
FROM public.vendors v
WHERE vo.vendor_name = v.name
  AND vo.vendor_id IS NULL;

-- Create index for the FK join
CREATE INDEX idx_vendor_outreach_vendor_id ON public.vendor_outreach(vendor_id);

-- Drop the old weak policy
DROP POLICY IF EXISTS "Users can view vendors via outreach" ON public.vendors;

-- Create new policy using proper FK join
CREATE POLICY "Users can view vendors via outreach"
ON public.vendors
FOR SELECT
TO authenticated
USING (
  (is_active = true) AND EXISTS (
    SELECT 1 FROM public.vendor_outreach vo
    WHERE vo.vendor_id = vendors.id
      AND vo.user_id = auth.uid()
  )
);