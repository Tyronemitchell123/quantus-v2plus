-- Enable pg_net for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Function that fires after a profile is created (i.e. new user signup)
CREATE OR REPLACE FUNCTION public.send_welcome_email_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  _email text;
  _supabase_url text;
  _service_role_key text;
BEGIN
  -- Get user email from auth.users
  SELECT email INTO _email FROM auth.users WHERE id = NEW.user_id;

  IF _email IS NULL THEN
    RETURN NEW;
  END IF;

  -- Read secrets from vault or env
  _supabase_url := current_setting('app.settings.supabase_url', true);
  _service_role_key := current_setting('app.settings.service_role_key', true);

  -- If app settings not available, try direct config
  IF _supabase_url IS NULL OR _supabase_url = '' THEN
    SELECT decrypted_secret INTO _supabase_url
    FROM vault.decrypted_secrets
    WHERE name = 'supabase_url'
    LIMIT 1;
  END IF;

  IF _service_role_key IS NULL OR _service_role_key = '' THEN
    SELECT decrypted_secret INTO _service_role_key
    FROM vault.decrypted_secrets
    WHERE name = 'service_role_key'
    LIMIT 1;
  END IF;

  -- Fall back: use the project URL directly
  IF _supabase_url IS NULL OR _supabase_url = '' THEN
    _supabase_url := 'https://eqxgnxgbvvrjaxjiznjo.supabase.co';
  END IF;

  -- Only proceed if we have the service role key
  IF _service_role_key IS NOT NULL AND _service_role_key != '' THEN
    PERFORM extensions.http_post(
      url := _supabase_url || '/functions/v1/send-welcome-email',
      body := jsonb_build_object(
        'email', _email,
        'displayName', COALESCE(NEW.display_name, split_part(_email, '@', 1))
      ),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || _service_role_key
      )
    );
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Don't fail the signup if welcome email fails
  RAISE WARNING 'Welcome email trigger failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Trigger on profiles insert (fires after handle_new_user creates the profile)
CREATE TRIGGER on_profile_created_send_welcome
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_email_on_signup();
