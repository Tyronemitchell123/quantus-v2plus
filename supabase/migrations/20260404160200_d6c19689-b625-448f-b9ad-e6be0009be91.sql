
-- 1. Add trigger on commissions to force safe defaults on INSERT by regular users
CREATE OR REPLACE FUNCTION public.validate_commission_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If not service_role, force financial fields to safe defaults
  IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
    NEW.quantus_cut := 0;
    NEW.total_value := 0;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_commission_insert
BEFORE INSERT ON public.commissions
FOR EACH ROW
EXECUTE FUNCTION public.validate_commission_insert();

-- 2. Add trigger on user_roles to prevent self-promotion
CREATE OR REPLACE FUNCTION public.prevent_self_role_promotion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _requesting_uid uuid;
BEGIN
  -- Get the requesting user's ID (works even under service_role context)
  _requesting_uid := auth.uid();
  
  -- Block if a user is trying to assign admin role to themselves
  IF _requesting_uid IS NOT NULL AND NEW.user_id = _requesting_uid AND NEW.role = 'admin' THEN
    RAISE EXCEPTION 'Users cannot assign admin role to themselves';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_prevent_self_role_promotion
BEFORE INSERT OR UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_self_role_promotion();
