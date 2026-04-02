create or replace function public.get_service_users_with_tenant(target_tenant_id uuid)
returns setof public.service_users
SET search_path = public
language plpgsql
security definer -- Importante: la función se ejecuta con privilegios de la DB, no del usuario directo
as $$
begin
  
  return query
  select distinct su.*
  from public.service_users su
  join public.tenant_permissions tp on su.id = tp.service_user_id
  where tp.tenant_id = target_tenant_id;
  order by su.full_name ASC;
end;
$$;