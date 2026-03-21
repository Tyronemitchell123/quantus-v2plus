
-- Allow updating referral codes uses_count (needed by the redeem-referral edge function via service role)
-- No client-side policy needed since the edge function uses service_role key

-- Allow inserting referral_redemptions via service role (already handled by service_role bypass)
-- No migration needed for RLS since service_role bypasses RLS
SELECT 1;
