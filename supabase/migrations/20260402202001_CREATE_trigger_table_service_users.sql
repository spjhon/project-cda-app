 --Trigger que se dispara al actualizar is_active
--Cambiamos el trigger para que escuche INSERT y UPDATE
CREATE TRIGGER on_auth_user_created_or_updated
  AFTER INSERT OR UPDATE OF is_active ON public.service_users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_active_status();