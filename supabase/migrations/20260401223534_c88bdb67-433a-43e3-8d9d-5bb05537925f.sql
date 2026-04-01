
CREATE TABLE public.hospitality_concierge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.vanguard_clients(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  partnerships text[] NOT NULL DEFAULT '{}',
  bms_settings jsonb NOT NULL DEFAULT '{"temp": 18, "lux": "Amber_Warm", "scent": "Magnesium_Vapor"}'::jsonb,
  nutritional_preload jsonb NOT NULL DEFAULT '{}'::jsonb,
  trigger_type text NOT NULL DEFAULT 'Aviation_Landing_Minus_120m',
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hospitality_concierge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own concierge configs"
  ON public.hospitality_concierge FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all concierge configs"
  ON public.hospitality_concierge FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_hospitality_concierge_updated_at
  BEFORE UPDATE ON public.hospitality_concierge
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_hospitality_concierge_user ON public.hospitality_concierge(user_id);
CREATE INDEX idx_hospitality_concierge_client ON public.hospitality_concierge(client_id);
