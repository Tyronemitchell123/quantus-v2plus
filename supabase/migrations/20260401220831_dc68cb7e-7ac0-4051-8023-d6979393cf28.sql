
CREATE TABLE public.system_health (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  function_name text NOT NULL,
  event_type text NOT NULL,
  source_url text,
  fallback_used text,
  success_rate numeric,
  severity text NOT NULL DEFAULT 'info',
  resolved boolean NOT NULL DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage system health"
  ON public.system_health FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admins can view system health"
  ON public.system_health FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_system_health_function ON public.system_health (function_name, created_at DESC);
CREATE INDEX idx_system_health_severity ON public.system_health (severity, resolved);
