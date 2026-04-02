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
      select id from public.service_users where auth_user_id = auth.uid()
    )
  )
);