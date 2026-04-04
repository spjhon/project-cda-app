-- Trigger para updated_at (reusas tu misma función)
create trigger set_service_users_updated_at
before update on public.service_users
for each row
execute function public.set_updated_at();

-- Trigger que se dispara al actualizar is_active
CREATE TRIGGER on_auth_user_active_update
  AFTER UPDATE OF is_active ON public.service_users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_active_status();