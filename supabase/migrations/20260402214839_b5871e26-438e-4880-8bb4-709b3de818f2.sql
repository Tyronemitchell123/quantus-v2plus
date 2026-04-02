-- Drop the insecure anon policy
DROP POLICY IF EXISTS "Anyone can view active vendors" ON public.vendors;

-- Add authenticated-only policy for viewing active vendors
CREATE POLICY "Authenticated users can view active vendors"
ON public.vendors
FOR SELECT
TO authenticated
USING (is_active = true);