drop policy if exists "Acceso total verificado: JWT + Base de Datos" on public.tenants;

create policy "Acceso total verificado: JWT + Base de Datos"
on public.tenants
for select
to authenticated
using (
  -- 1. Filtro de primera línea (JWT)
  -- Buscamos el slug de la fila actual dentro del array de tenants del JWT
  (((select auth.jwt()) -> 'app_metadata' -> 'tenants') ? tenants.slug)
  
  AND 
  
  -- 2. Verdad absoluta (Base de Datos)
  exists (
    select 1 
    from public.tenant_permissions tp
    inner join public.service_users su on tp.service_user_id = su.id
    where tp.tenant_id = tenants.id  -- Referencia a la fila evaluada
    and su.auth_user_id = (select auth.uid()) -- Filtro por el usuario actual
  )
);