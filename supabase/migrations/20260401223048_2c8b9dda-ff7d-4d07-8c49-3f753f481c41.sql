
-- 1. Add stripe_customer_id to existing vanguard_clients
ALTER TABLE public.vanguard_clients
ADD COLUMN IF NOT EXISTS stripe_customer_id text UNIQUE;

-- 2. Agent Logs table
CREATE TABLE public.agent_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name text NOT NULL,
  task_type text NOT NULL DEFAULT 'scrape',
  status text NOT NULL DEFAULT 'success',
  failure_reason text,
  visual_coordinates jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all agent logs"
  ON public.agent_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can manage agent logs"
  ON public.agent_logs FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 3. Success Fees table
CREATE TABLE public.success_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.vanguard_clients(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  service_type text NOT NULL DEFAULT 'aviation',
  raw_cost_cents bigint NOT NULL DEFAULT 0,
  fee_percentage numeric(4,2) NOT NULL DEFAULT 0.05,
  fee_cents bigint GENERATED ALWAYS AS (CASE WHEN raw_cost_cents * fee_percentage > 0 THEN (raw_cost_cents * fee_percentage)::bigint ELSE 0 END) STORED,
  billed_status boolean NOT NULL DEFAULT false,
  stripe_invoice_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.success_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own success fees"
  ON public.success_fees FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all success fees"
  ON public.success_fees FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can manage success fees"
  ON public.success_fees FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER update_success_fees_updated_at
  BEFORE UPDATE ON public.success_fees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_agent_logs_agent_name ON public.agent_logs(agent_name);
CREATE INDEX idx_agent_logs_status ON public.agent_logs(status);
CREATE INDEX idx_success_fees_client_id ON public.success_fees(client_id);
CREATE INDEX idx_success_fees_user_id ON public.success_fees(user_id);
CREATE INDEX idx_success_fees_billed ON public.success_fees(billed_status);
