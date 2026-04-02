drop policy if exists "Users can see tickets from their tenants" on public.tickets;

-- POLÍTICA: Los usuarios solo pueden ver tickets de los tenants a los que pertenecen
create policy "Users can see tickets from their tenants"
on public.tickets
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


drop policy if exists "Users can create tickets in their tenants" on public.tickets;

-- POLÍTICA: Los usuarios pueden crear tickets en los tenants donde son miembros
create policy "Users can create tickets in their tenants"
on public.tickets
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



drop policy if exists "Authors can update their own tickets" on public.tickets;

-- POLÍTICA: Solo el autor (o un admin) puede actualizar el ticket
-- (Aquí puedes simplificarlo o hacerlo más complejo según tus roles)
create policy "Authors can update their own tickets"
on public.tickets
for update
to authenticated
using (
  created_by in (
    select id from public.service_users where auth_user_id = (select auth.uid())
  )
)
with check (
  created_by in (
    select id from public.service_users where auth_user_id = (select auth.uid())
  )
);



drop policy if exists "Users can delete own tickets" on public.tickets;

create policy "Users can delete own tickets"
on public.tickets
for delete
to authenticated
using (
  exists (
    select 1 
    from public.service_users su
    join public.tenant_permissions tp on tp.service_user_id = su.id
    where su.auth_user_id = (select auth.uid())
    and public.tickets.created_by = su.id
    and public.tickets.tenant_id = tp.tenant_id
  )
);