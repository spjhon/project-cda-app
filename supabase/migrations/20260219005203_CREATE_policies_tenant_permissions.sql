
-- ==========================================
-- RLS
-- ==========================================

alter table public.tenant_permissions enable row level security;

-- Usuarios pueden ver sus propias membresías
create policy "Users can read their tenant memberships"
on public.tenant_permissions
for select
to authenticated
using (
  service_user_id in (
    select id
    from public.service_users
    where auth_user_id = auth.uid()
  )
);

-- Solo el backend (service_role) debería crear/editar permisos
