
-- Create timestamp function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Marketing blog posts
CREATE TABLE public.marketing_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  og_image_prompt TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.marketing_social (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  content TEXT NOT NULL,
  hashtags TEXT[] DEFAULT '{}',
  tone TEXT,
  post_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.marketing_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  campaign_name TEXT NOT NULL,
  headline TEXT NOT NULL,
  body_text TEXT NOT NULL,
  cta TEXT,
  target_audience TEXT,
  platform TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.marketing_seo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  page_path TEXT NOT NULL UNIQUE,
  meta_title TEXT,
  meta_description TEXT,
  json_ld JSONB,
  keywords TEXT[] DEFAULT '{}',
  score INTEGER,
  suggestions TEXT[],
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.marketing_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_social ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_seo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage marketing posts" ON public.marketing_posts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage social posts" ON public.marketing_social FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage ad copy" ON public.marketing_ads FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage SEO data" ON public.marketing_seo FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can read published posts" ON public.marketing_posts FOR SELECT USING (status = 'published');

CREATE TRIGGER update_marketing_posts_updated_at BEFORE UPDATE ON public.marketing_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_marketing_seo_updated_at BEFORE UPDATE ON public.marketing_seo FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
