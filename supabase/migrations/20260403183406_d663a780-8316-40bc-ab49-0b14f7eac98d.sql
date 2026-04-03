
-- Allow service role to UPDATE commission_logs (for payout status progression)
CREATE POLICY "Service role can update commissions"
  ON public.commission_logs
  FOR UPDATE
  TO public
  USING (auth.role() = 'service_role'::text)
  WITH CHECK (auth.role() = 'service_role'::text);

-- Allow admins to update commission status
CREATE POLICY "Admins can update commissions"
  ON public.commission_logs
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow authenticated users to insert their own audit logs
CREATE POLICY "Users can insert own audit logs"
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
