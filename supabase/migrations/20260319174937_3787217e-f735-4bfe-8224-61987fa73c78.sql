
-- Quantum jobs table
CREATE TABLE public.quantum_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL DEFAULT 'aws-braket',
  provider_job_id TEXT,
  device_arn TEXT NOT NULL,
  shots INTEGER NOT NULL DEFAULT 100,
  circuit_format TEXT NOT NULL DEFAULT 'openqasm',
  circuit_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  cost_estimate_usd NUMERIC
);

ALTER TABLE public.quantum_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quantum jobs"
  ON public.quantum_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quantum jobs"
  ON public.quantum_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quantum jobs"
  ON public.quantum_jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_quantum_jobs_updated_at
  BEFORE UPDATE ON public.quantum_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Quantum job results table
CREATE TABLE public.quantum_job_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quantum_job_id UUID NOT NULL REFERENCES public.quantum_jobs(id) ON DELETE CASCADE,
  result_counts_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  raw_result_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.quantum_job_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view results of their own jobs"
  ON public.quantum_job_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quantum_jobs
      WHERE quantum_jobs.id = quantum_job_results.quantum_job_id
        AND quantum_jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert results for their own jobs"
  ON public.quantum_job_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quantum_jobs
      WHERE quantum_jobs.id = quantum_job_results.quantum_job_id
        AND quantum_jobs.user_id = auth.uid()
    )
  );
