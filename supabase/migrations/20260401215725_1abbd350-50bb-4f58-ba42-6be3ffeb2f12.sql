
-- Function to auto-create a vendor record from contact_submissions
CREATE OR REPLACE FUNCTION public.auto_create_vendor_from_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _category text;
  _description text;
  _phone text;
  _address text;
BEGIN
  -- Only process vendor-related submissions
  IF NEW.classification NOT IN ('vendor_registration', 'partner_application') THEN
    RETURN NEW;
  END IF;

  -- Check if vendor with same email already exists
  IF EXISTS (SELECT 1 FROM public.vendors WHERE email = NEW.email) THEN
    RETURN NEW;
  END IF;

  -- Extract category from message body
  _category := 'general';
  IF NEW.message ~ 'Category:\s*(\w+)' THEN
    _category := lower(trim((regexp_match(NEW.message, 'Category:\s*([^\n,]+)'))[1]));
  END IF;

  -- Extract phone from message
  _phone := NULL;
  IF NEW.message ~ 'Phone:\s*' THEN
    _phone := trim((regexp_match(NEW.message, 'Phone:\s*([^\n]+)'))[1]);
    IF _phone = 'N/A' THEN _phone := NULL; END IF;
  END IF;

  -- Extract description from message  
  _description := NULL;
  IF NEW.message ~ 'Description:\s*' THEN
    _description := trim((regexp_match(NEW.message, 'Description:\s*([^\n]+)'))[1]);
    IF _description = 'N/A' THEN _description := NULL; END IF;
  END IF;

  -- Extract address for location
  _address := NULL;
  IF NEW.message ~ 'Address:\s*' THEN
    _address := trim((regexp_match(NEW.message, 'Address:\s*([^\n]+)'))[1]);
    IF _address = 'N/A' THEN _address := NULL; END IF;
  END IF;

  -- Insert into vendors table as inactive (pending admin approval)
  INSERT INTO public.vendors (
    name, company, email, phone, category, description, location,
    is_active, is_verified, tier,
    metadata
  ) VALUES (
    NEW.name,
    COALESCE(NEW.company, NEW.name),
    NEW.email,
    _phone,
    _category,
    _description,
    _address,
    false,  -- inactive until admin approves
    false,  -- unverified until admin verifies
    'standard',
    jsonb_build_object(
      'source', NEW.classification,
      'submission_id', NEW.id,
      'submitted_at', NEW.created_at
    )
  );

  RETURN NEW;
END;
$$;

-- Create trigger on contact_submissions
CREATE TRIGGER on_vendor_submission
  AFTER INSERT ON public.contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_vendor_from_submission();
