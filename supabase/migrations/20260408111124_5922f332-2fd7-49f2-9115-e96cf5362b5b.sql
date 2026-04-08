-- Extend profiles table with full address and account type
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS address_line1 text,
  ADD COLUMN IF NOT EXISTS address_line2 text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS postcode text,
  ADD COLUMN IF NOT EXISTS account_type text NOT NULL DEFAULT 'client',
  ADD COLUMN IF NOT EXISTS service_category text,
  ADD COLUMN IF NOT EXISTS service_description text,
  ADD COLUMN IF NOT EXISTS kyc_status text NOT NULL DEFAULT 'unverified';

-- Create KYC verifications table
CREATE TABLE public.kyc_verifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  document_type text NOT NULL DEFAULT 'passport',
  document_front_path text,
  document_back_path text,
  address_proof_path text,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own KYC records
CREATE POLICY "Users can view own KYC"
  ON public.kyc_verifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can submit KYC
CREATE POLICY "Users can submit KYC"
  ON public.kyc_verifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update own pending KYC
CREATE POLICY "Users can update own pending KYC"
  ON public.kyc_verifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending');

-- Admins can view all KYC
CREATE POLICY "Admins can view all KYC"
  ON public.kyc_verifications FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update all KYC (approve/reject)
CREATE POLICY "Admins can update all KYC"
  ON public.kyc_verifications FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_kyc_verifications_updated_at
  BEFORE UPDATE ON public.kyc_verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create private storage bucket for KYC documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Users can upload to their own folder
CREATE POLICY "Users upload own KYC docs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can view their own uploads
CREATE POLICY "Users view own KYC docs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Admins can view all KYC docs
CREATE POLICY "Admins view all KYC docs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'kyc-documents' AND has_role(auth.uid(), 'admin'::app_role));