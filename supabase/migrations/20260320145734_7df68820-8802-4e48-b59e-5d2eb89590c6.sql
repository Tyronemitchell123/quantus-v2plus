
-- Replace the overly permissive INSERT policy with one scoped to authenticated users
DROP POLICY "Service role can insert audit logs" ON public.audit_logs;

CREATE POLICY "Authenticated users can insert own audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
