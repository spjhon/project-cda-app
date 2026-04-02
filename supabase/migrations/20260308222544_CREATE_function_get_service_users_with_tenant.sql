create or replace function public.get_service_users_with_tenant(target_tenant_id uuid)
returns setof public.service_users
SET search_path = public
language plpgsql
security definer -- Importante: la función se ejecuta con privilegios de la DB, no del usuario directo
as $$
begin
  -- 1. Comprobamos si el usuario que llama a la función tiene permisos en ese tenant
  if not exists (
    select 1
    from public.tenant_permissions tp
    join public.service_users su on tp.service_user_id = su.id
    where tp.tenant_id = target_tenant_id
    and su.auth_user_id = auth.uid()
  ) then
    raise exception 'Acceso denegado: no perteneces a este tenant.';
  end if;

  -- 2. Si pasó la comprobación, devolvemos los usuarios
  return query
  select su.*
  from public.service_users su
  join public.tenant_permissions tp on su.id = tp.service_user_id
  where tp.tenant_id = target_tenant_id;
end;
$$;