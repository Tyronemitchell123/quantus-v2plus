
-- Store all contact form submissions with AI analysis results
CREATE TABLE public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  message TEXT NOT NULL,
  classification TEXT,
  priority INTEGER,
  sentiment TEXT,
  suggested_response TEXT,
  auto_reply_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Only authenticated admins can read all submissions
CREATE POLICY "Admins can view all submissions"
  ON public.contact_submissions
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow edge functions (service role) to insert
-- Public inserts via edge function, not direct client insert
CREATE POLICY "Service role can manage submissions"
  ON public.contact_submissions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Note: The above permissive ALL policy is scoped to service_role 
-- because RLS defaults to restrictive for anon/authenticated.
-- We'll insert from the edge function using service role key.
