
-- Fix 1: addon_purchases - Remove user INSERT, restrict to service_role
DROP POLICY IF EXISTS "Users can create their own addon purchases" ON public.addon_purchases;

CREATE POLICY "Service role can insert addon purchases"
ON public.addon_purchases
FOR INSERT
TO public
WITH CHECK (auth.role() = 'service_role');

-- Fix 2: webhooks - Replace SELECT policy to exclude secret column
-- We'll create a view that excludes the secret and adjust the approach
-- Actually, we can't easily exclude columns via RLS. Instead, we'll:
-- 1. Remove the secret from the existing SELECT by using a view
-- 2. Keep the table policies as-is but create a safe view

CREATE OR REPLACE VIEW public.webhooks_safe AS
SELECT id, user_id, url, events, is_active, last_triggered_at, created_at, updated_at
FROM public.webhooks;

-- Make the view respect RLS of the underlying table
ALTER VIEW public.webhooks_safe SET (security_invoker = on);
