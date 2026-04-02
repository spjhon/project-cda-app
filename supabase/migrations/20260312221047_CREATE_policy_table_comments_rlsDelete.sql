-- POLÍTICA: Solo miembros que tengan su tenant puede borrar comentarios
create policy "Users can delete comments from their tenats"
on public.comments
for delete
to authenticated
using (

  created_by = (
    select id from public.service_users where auth_user_id = auth.uid()
  )

  OR

  tenant_id in (
    select tenant_id 
    from public.tenant_permissions 
    where service_user_id in (
      select id from public.service_users where auth_user_id = auth.uid()
    )
  )
);