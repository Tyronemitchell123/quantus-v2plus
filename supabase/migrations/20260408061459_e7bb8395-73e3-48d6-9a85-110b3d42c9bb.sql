-- Remove user-facing INSERT policy; service_role INSERT policy already exists
DROP POLICY IF EXISTS "Users can insert their own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can create their own audit logs" ON public.audit_logs;

-- Ensure no other user INSERT policies exist by listing what remains
-- The only INSERT policy should be "Service role can insert audit logs"
