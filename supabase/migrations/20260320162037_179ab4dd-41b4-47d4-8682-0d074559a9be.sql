
-- 1. FIX: Remove overly permissive "Service role can manage subscriptions" policy
-- Users should only SELECT; writes come from service role (edge functions)
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;

-- 2. FIX: Remove overly permissive "Service role can manage payments" policy
DROP POLICY IF EXISTS "Service role can manage payments" ON public.payments;

-- 3. FIX: Remove user-facing INSERT on quantum_job_results (should be service-role only)
DROP POLICY IF EXISTS "Users can insert results for their own jobs" ON public.quantum_job_results;
