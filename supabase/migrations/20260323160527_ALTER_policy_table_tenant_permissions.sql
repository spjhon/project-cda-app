drop policy if exists "Users can read their tenant memberships" on public.tenant_permissions;

-- Usuarios pueden ver sus propias membresías
create policy "Users can read their tenant memberships"
on public.tenant_permissions
for select
to authenticated
using (
  service_user_id in (
    select id
    from public.service_users
    where auth_user_id = (select auth.uid())
  )
);