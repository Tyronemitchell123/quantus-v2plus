
-- 1. Make quantusbucket private
UPDATE storage.buckets SET public = false WHERE id = 'quantusbucket';

-- 2. Remove the overly permissive anon SELECT policy
DROP POLICY IF EXISTS "Public can view public bucket files" ON storage.objects;

-- 3. Fix audit_logs: Remove user INSERT policy, add service role only
DROP POLICY IF EXISTS "Authenticated users can insert own audit logs" ON public.audit_logs;

CREATE POLICY "Service role can insert audit logs"
ON public.audit_logs
FOR INSERT
TO public
WITH CHECK (auth.role() = 'service_role');

-- 4. Add admin read access for audit logs  
CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
