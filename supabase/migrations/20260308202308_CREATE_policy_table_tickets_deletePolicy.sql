-- ==========================================================
-- Migración: Agregar política de borrado para tickets
-- ==========================================================

-- 2. Creamos la política definitiva
create policy "Users can delete own tickets"
on public.tickets
for delete
to authenticated
using (
  exists (
    select 1 
    from public.service_users su
    join public.tenant_permissions tp on tp.service_user_id = su.id
    where su.auth_user_id = auth.uid()
    and public.tickets.created_by = su.id
    and public.tickets.tenant_id = tp.tenant_id
  )
);