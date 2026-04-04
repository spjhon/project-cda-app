-- ==========================================
-- Tabla: tenant_permissions (Versión Actualizada)
-- ==========================================

CREATE TABLE public.tenant_permissions (
    -- Identificadores
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id         UUID NOT NULL,
    service_user_id   UUID NOT NULL,

    -- Datos de Membresía
    -- Nota: El default ahora es 'recepcionista' para coincidir con los nuevos roles
    role              TEXT NOT NULL DEFAULT 'recepcionista',

    -- Auditoría
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- FOREIGN KEYS (Relaciones)
-- ==========================================

ALTER TABLE public.tenant_permissions
    ADD CONSTRAINT tenant_permissions_tenant_id_fkey 
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.tenant_permissions
    ADD CONSTRAINT tenant_permissions_service_user_id_fkey 
    FOREIGN KEY (service_user_id) REFERENCES public.service_users(id) ON DELETE CASCADE;

-- ==========================================
-- CONSTRAINTS (Validaciones y Unicidad)
-- ==========================================

-- 1. Restricción de Roles permitidos
ALTER TABLE public.tenant_permissions
    ADD CONSTRAINT tenant_permissions_role_check 
    CHECK (role IN (
        'gerente', 
        'recepcionista', 
        'aux_administrativo', 
        'director_tecnico'
    ));

-- 2. Unicidad: Un usuario solo puede tener una entrada por Tenant
-- (Si luego decides que un usuario puede tener varios roles, recuerda borrar esta)
ALTER TABLE public.tenant_permissions
    ADD CONSTRAINT tenant_permissions_unique_pair 
    UNIQUE (tenant_id, service_user_id);

-- ==========================================
-- COMENTARIOS
-- ==========================================

COMMENT ON TABLE public.tenant_permissions IS 'Mapeo de usuarios a tenants con roles específicos del taller. v1.1';
COMMENT ON COLUMN public.tenant_permissions.role IS 'Roles: gerente, recepcionista, auxadministrativo, directortecnico';

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
    where auth_user_id = (select auth.uid())
  )
);

-- Solo el backend (service_role) debería crear/editar permisos
