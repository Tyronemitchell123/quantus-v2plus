
-- Remove the overly permissive policy; edge functions use service_role which bypasses RLS
DROP POLICY "Service role can manage submissions" ON public.contact_submissions;
