-- Remove the user INSERT policy that allows arbitrary commission amounts
DROP POLICY IF EXISTS "Users can create own commissions" ON public.commission_logs;

-- Only service role (edge functions) can insert commission records
CREATE POLICY "Service role can insert commissions"
ON public.commission_logs
FOR INSERT
TO public
WITH CHECK (auth.role() = 'service_role');