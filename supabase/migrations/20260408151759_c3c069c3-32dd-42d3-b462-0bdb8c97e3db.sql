
-- 1. Remove user SELECT policy on otp_codes (codes should only be verified server-side)
DROP POLICY IF EXISTS "Users can view own OTP codes" ON public.otp_codes;

-- 2. Add restrictive policy on user_roles to explicitly block non-admin inserts
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. Add DELETE and UPDATE storage policies for kyc-documents bucket
CREATE POLICY "Users can delete their own KYC documents"
ON storage.objects
FOR DELETE
USING (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own KYC documents"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can delete KYC documents"
ON storage.objects
FOR DELETE
USING (bucket_id = 'kyc-documents' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update KYC documents"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'kyc-documents' AND has_role(auth.uid(), 'admin'::app_role));
