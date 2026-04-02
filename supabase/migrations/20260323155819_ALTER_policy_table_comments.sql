drop policy if exists "Users can see comments from their tenants" on public.comments;

-- POLÍTICA: Solo los miembros del tenant pueden ver los comentarios
create policy "Users can see comments from their tenants"
on public.comments
for select
to authenticated
using (
  tenant_id in (
    select tenant_id 
    from public.tenant_permissions 
    where service_user_id in (
      select id from public.service_users where auth_user_id = (select auth.uid())
    )
  )
);

drop policy if exists "Users can insert comments in their tenants" on public.comments;

-- POLÍTICA: Solo miembros del tenant pueden insertar comentarios en tickets de ese tenant
create policy "Users can insert comments in their tenants"
on public.comments
for insert
to authenticated
with check (
  tenant_id in (
    select tenant_id 
    from public.tenant_permissions 
    where service_user_id in (
      select id from public.service_users where auth_user_id = (select auth.uid())
    )
  )
);

drop policy if exists "Users can delete comments from their tenats" on public.comments;

-- POLÍTICA: Solo miembros que tengan su tenant puede borrar comentarios
create policy "Users can delete comments from their tenats"
on public.comments
for delete
to authenticated
using (

  created_by = (
    select id from public.service_users where auth_user_id = (select auth.uid())
  )

  OR

  tenant_id in (
    select tenant_id 
    from public.tenant_permissions 
    where service_user_id in (
      select id from public.service_users where auth_user_id = (select auth.uid())
    )
  )
);