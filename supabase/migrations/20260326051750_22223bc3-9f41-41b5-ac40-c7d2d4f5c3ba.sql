
-- Vendor outreach table: tracks all outreach activities per sourcing result
CREATE TABLE public.vendor_outreach (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  sourcing_result_id UUID NOT NULL REFERENCES public.sourcing_results(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  vendor_name TEXT NOT NULL,
  vendor_company TEXT,
  vendor_email TEXT,
  vendor_phone TEXT,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  outreach_strategy JSONB DEFAULT '{}'::jsonb,
  vendor_score INTEGER DEFAULT 0,
  response_time_hours NUMERIC,
  follow_up_count INTEGER DEFAULT 0,
  next_follow_up_at TIMESTAMPTZ,
  negotiation_ready BOOLEAN DEFAULT false,
  negotiation_prep JSONB DEFAULT '{}'::jsonb,
  documents_requested JSONB DEFAULT '[]'::jsonb,
  documents_received JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vendor messages table: individual messages in a vendor conversation
CREATE TABLE public.vendor_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  outreach_id UUID NOT NULL REFERENCES public.vendor_outreach(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  direction TEXT NOT NULL DEFAULT 'outbound',
  channel TEXT NOT NULL DEFAULT 'email',
  subject TEXT,
  body TEXT NOT NULL,
  tone TEXT DEFAULT 'formal',
  ai_generated BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vendor_outreach ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for vendor_outreach
CREATE POLICY "Users can view their own outreach" ON public.vendor_outreach FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own outreach" ON public.vendor_outreach FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own outreach" ON public.vendor_outreach FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all outreach" ON public.vendor_outreach FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for vendor_messages
CREATE POLICY "Users can view their own messages" ON public.vendor_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own messages" ON public.vendor_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all messages" ON public.vendor_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at on vendor_outreach
CREATE TRIGGER update_vendor_outreach_updated_at
  BEFORE UPDATE ON public.vendor_outreach
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
