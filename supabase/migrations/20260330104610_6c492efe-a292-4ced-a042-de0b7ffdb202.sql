
-- 1. Remove dangerous user INSERT/UPDATE on user_credits
DROP POLICY IF EXISTS "Users can update their own credits" ON public.user_credits;
DROP POLICY IF EXISTS "Users can insert their own credits" ON public.user_credits;

-- 2. Remove dangerous user INSERT on credit_transactions
DROP POLICY IF EXISTS "Users can insert their own credit transactions" ON public.credit_transactions;

-- 3. Add service-role-only policies for credit mutations
CREATE POLICY "Service role can manage credits"
  ON public.user_credits FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can manage credit transactions"
  ON public.credit_transactions FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 4. Storage policies for quantusbucket
CREATE POLICY "Users can read own quantum files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'quantusbucket' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own quantum files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'quantusbucket' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own quantum files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'quantusbucket' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 5. Fix mutable search paths on functions
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public;
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public;

-- 6. Realtime channel policies
ALTER PUBLICATION supabase_realtime SET TABLE public.deals, public.quantum_jobs, public.anomaly_alerts, public.sourcing_results;
