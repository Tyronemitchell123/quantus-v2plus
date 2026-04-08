-- 1. Fix vendor_outreach INSERT policy: validate deal belongs to inserting user
DROP POLICY IF EXISTS "Users can create their own outreach" ON public.vendor_outreach;

CREATE POLICY "Users can create their own outreach"
ON public.vendor_outreach
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.deals
    WHERE deals.id = deal_id
      AND deals.user_id = auth.uid()
  )
);

-- 2. Remove user-facing INSERT/UPDATE on commissions (service_role only)
DROP POLICY IF EXISTS "Users can create own commissions" ON public.commissions;
DROP POLICY IF EXISTS "Users can update own commissions" ON public.commissions;
