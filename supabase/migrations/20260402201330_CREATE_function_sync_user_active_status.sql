-- 1. Función que sincroniza el estado activo con Auth Metadata
CREATE OR REPLACE FUNCTION public.sync_user_active_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_metadata = raw_app_metadata || 
    jsonb_build_object('is_active', NEW.is_active)
  WHERE id = NEW.auth_user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;