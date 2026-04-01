
CREATE TABLE public.vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text NOT NULL,
  email text,
  phone text,
  website text,
  category text NOT NULL,
  description text,
  location text,
  specialties text[] DEFAULT '{}',
  credentials jsonb DEFAULT '{}',
  tier text DEFAULT 'standard',
  is_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  logo_url text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active vendors"
  ON public.vendors FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins manage vendors"
  ON public.vendors FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
