drop policy if exists "Users can see attachments from their tenants" on public.comment_attachments;

-- Política: Solo miembros del tenant pueden ver sus archivos adjuntos
create policy "Users can see attachments from their tenants"
on public.comment_attachments
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


drop policy if exists "Users can insert attachments into their tenants" on public.comment_attachments;

-- Política para permitir el INSERT
create policy "Users can insert attachments into their tenants"
on public.comment_attachments
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