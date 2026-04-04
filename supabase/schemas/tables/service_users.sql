-- ==========================================
-- Tabla: service_users (Versión Final v1.3)
-- ==========================================

CREATE TABLE public.service_users (
    -- Identificadores
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relación con el usuario de Supabase Auth
    auth_user_id      UUID NOT NULL,

    -- Información Personal e Identificación
    full_name         TEXT,
    document_type     TEXT NOT NULL DEFAULT 'cedula',
    document_number   TEXT NOT NULL,
    
    -- Estado Maestro
    is_active         BOOLEAN NOT NULL DEFAULT true,

    -- Auditoría
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- FOREIGN KEYS (Relaciones)
-- ==========================================

ALTER TABLE public.service_users
    ADD CONSTRAINT service_users_auth_user_id_fkey 
    FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ==========================================
-- CONSTRAINTS (Validaciones y Unicidad)
-- ==========================================

-- 1. Unicidad de cuenta Auth (Un perfil por usuario auth)
ALTER TABLE public.service_users
    ADD CONSTRAINT service_users_auth_user_id_key UNIQUE (auth_user_id);

-- 2. Unicidad Compuesta (Tipo + Número) - Evita duplicados legales
ALTER TABLE public.service_users
    ADD CONSTRAINT service_users_document_unique UNIQUE (document_type, document_number);

-- 3. Validación de tipos de documento (Check Constraint)
ALTER TABLE public.service_users
    ADD CONSTRAINT service_users_document_type_check 
    CHECK (document_type IN (
        'cedula', 
        'cedula_extrangeria', 
        'pasaporte', 
        'nit', 
        'targeta_identidad'
    ));

-- ==========================================
-- ÍNDICES (Rendimiento)
-- ==========================================

-- Búsqueda por número de identificación
CREATE INDEX IF NOT EXISTS service_users_document_number_idx 
    ON public.service_users USING btree (document_number);

-- Búsqueda por estado activo
CREATE INDEX IF NOT EXISTS service_users_is_active_idx 
    ON public.service_users USING btree (is_active);

-- Búsqueda difusa por nombre (Requiere extensión pg_trgm)
CREATE INDEX IF NOT EXISTS service_users_full_name_trgm_idx 
    ON public.service_users USING gin (full_name gin_trgm_ops);

-- ==========================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- ==========================================

COMMENT ON TABLE public.service_users IS 'Perfil de identidad de los usuarios del sistema. v1.3';
COMMENT ON COLUMN public.service_users.is_active IS 'Control maestro: false revoca acceso total.';
COMMENT ON COLUMN public.service_users.document_type IS 'Tipos: cedula, cedula_extrangeria, pasaporte, nit, targeta_identidad';


-- Índice para búsqueda de texto (GIN)
create extension if not exists pg_trgm;
create index if not exists service_users_full_name_trgm_idx on public.service_users using gin (full_name gin_trgm_ops);

-- ==========================================
-- GRANTS
-- ==========================================



-- Permiso para role authenticated
grant select, insert, update, delete
on table public.service_users
to authenticated;

-- Permiso para el service role
grant select, insert, update, delete
on table public.service_users
to service_role;

-- ==========================================
-- RLS
-- ==========================================
alter table public.service_users enable row level security;

create policy "Users can read their own service_user"
on public.service_users
for select
to authenticated
using (auth_user_id = (select auth.uid()));

create policy "Users can insert their own service_user"
on public.service_users
for insert
to authenticated
with check (auth_user_id = (select auth.uid()));

create policy "Users can update their own service_user"
on public.service_users
for update
to authenticated
using (auth_user_id = (select auth.uid()))
with check (auth_user_id = (select auth.uid()));

create policy "Users can delete their own service_user"
on public.service_users
for delete
to authenticated
using (auth_user_id = (select auth.uid()));
