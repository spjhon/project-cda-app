create policy "Users can read service_users from their same tenants"
on public.service_users
for select
to authenticated
using (
  auth_user_id = auth.uid()
  OR
  id in (
    select service_user_id 
    from public.tenant_permissions
    where tenant_id in (
      select tenant_id 
      from public.tenant_permissions
      where service_user_id = (select id from public.service_users where auth_user_id = auth.uid())
    )
  )
);