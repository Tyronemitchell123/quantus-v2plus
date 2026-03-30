-- Fix security definer view - set to INVOKER so RLS of querying user applies
ALTER VIEW public.storefront_products SET (security_invoker = on);