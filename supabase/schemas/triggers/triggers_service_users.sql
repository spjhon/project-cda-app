-- Trigger para updated_at (reusas tu misma función)
create trigger set_service_users_updated_at
before update on public.service_users
for each row
execute function public.set_updated_at();

