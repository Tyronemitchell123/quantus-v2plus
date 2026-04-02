-- Remove plaintext wearable API token column
ALTER TABLE public.vanguard_clients DROP COLUMN IF EXISTS wearable_api_token;