
-- 1. Security Audit Log
CREATE TABLE public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  agent_id text,
  ip_address text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert security audit logs"
  ON public.security_audit_log FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admins can view all security audit logs"
  ON public.security_audit_log FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own security audit logs"
  ON public.security_audit_log FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_security_audit_log_user ON public.security_audit_log(user_id);
CREATE INDEX idx_security_audit_log_action ON public.security_audit_log(action);
CREATE INDEX idx_security_audit_log_created ON public.security_audit_log(created_at DESC);

-- 2. Encrypted Secrets Table
CREATE TABLE public.encrypted_secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name text NOT NULL UNIQUE,
  encrypted_value text NOT NULL,
  encryption_method text NOT NULL DEFAULT 'aes-256-gcm',
  category text NOT NULL DEFAULT 'api_key',
  last_rotated_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.encrypted_secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only for encrypted secrets"
  ON public.encrypted_secrets FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER update_encrypted_secrets_updated_at
  BEFORE UPDATE ON public.encrypted_secrets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Patient Vault (HIPAA Pseudonymization)
CREATE TABLE public.patient_vault (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_uuid uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  real_name text NOT NULL,
  contact_phone text,
  contact_email text,
  procedure_intent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.patient_vault ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only for patient vault"
  ON public.patient_vault FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE INDEX idx_patient_vault_uuid ON public.patient_vault(patient_uuid);
CREATE INDEX idx_patient_vault_tenant ON public.patient_vault(tenant_id);

CREATE TRIGGER update_patient_vault_updated_at
  BEFORE UPDATE ON public.patient_vault
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
