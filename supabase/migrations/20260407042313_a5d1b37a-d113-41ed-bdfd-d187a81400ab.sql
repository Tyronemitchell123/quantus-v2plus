-- Remove user-level INSERT policy on audit_logs to prevent forgery
DROP POLICY IF EXISTS "Users can insert own audit logs" ON public.audit_logs;