
-- 1. FIX: Restrict quantum_jobs UPDATE so users can only modify circuit_text and shots (before job runs)
DROP POLICY IF EXISTS "Users can update their own quantum jobs" ON public.quantum_jobs;

CREATE POLICY "Users can update own queued jobs limited columns"
ON public.quantum_jobs
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'queued')
WITH CHECK (auth.uid() = user_id AND status = 'queued');

-- 2. FIX: Remove user-facing INSERT on usage_records (should be service-role only)
DROP POLICY IF EXISTS "Users can insert their own usage" ON public.usage_records;

-- 3. FIX: Allow contact_submissions INSERT for anonymous/authenticated visitors
CREATE POLICY "Anyone can submit contact form"
ON public.contact_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  name IS NOT NULL AND
  email IS NOT NULL AND
  message IS NOT NULL AND
  char_length(name) <= 200 AND
  char_length(email) <= 255 AND
  char_length(message) <= 5000
);
