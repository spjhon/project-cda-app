-- ==========================================
-- Tabla: tenant_permissions
-- ==========================================

create table public.tenant_permissions (
  id uuid primary key default gen_random_uuid(),

  tenant_id uuid not null references public.tenants(id) on delete cascade,
  service_user_id uuid not null references public.service_users(id) on delete cascade,

  role text not null default 'member' check (role in ('owner','admin','member')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

constraint tenant_permissions_unique_pair unique (tenant_id, service_user_id)
);

-- ==========================================
-- Comentarios
-- ==========================================

COMMENT ON TABLE public.tenant_permissions IS 'Version del schema v1';

comment on table public.tenant_permissions is 'Maps service_users to tenants with role-based permissions.';
comment on column public.tenant_permissions.role is 'Role of the user inside the tenant context.';

-- ==========================================
-- Índices estratégicos
-- ==========================================

create index tenant_permissions_tenant_id_idx on public.tenant_permissions (tenant_id);
create index tenant_permissions_service_user_id_idx on public.tenant_permissions (service_user_id);

-- ==========================================
-- GRANTS
-- ==========================================

grant select on table public.tenant_permissions to authenticated;
grant all on table public.tenant_permissions to service_role;