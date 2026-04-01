
CREATE TABLE public.longevity_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'CH',
  iata_codes TEXT[] NOT NULL DEFAULT '{}',
  specialties TEXT[] NOT NULL DEFAULT '{}',
  avg_price_cents BIGINT NOT NULL DEFAULT 0,
  website_url TEXT,
  firecrawl_target_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.longevity_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage longevity providers"
  ON public.longevity_providers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view active providers"
  ON public.longevity_providers FOR SELECT TO authenticated
  USING (is_active = true);
