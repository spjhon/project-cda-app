-- ==========================================
-- 0. CREACIÓN DEL TIPO ENUM (Normalizado)
-- ==========================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type_enum') THEN
        CREATE TYPE document_type_enum AS ENUM (
            'cedula_ciudadania', 
            'nit', 
            'nn', 
            'pasaporte', 
            'cedula_extranjeria', 
            'tarjeta_identidad', 
            'registro_civil', 
            'carnet_diplomatico', 
            'ti2'
        );
    END IF;
END $$;

-- ==========================================
-- 1. TABLA: personas
-- ==========================================

CREATE TABLE IF NOT EXISTS public.personas (
    -- Identificador único global.
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Para que los clientes de un CDA no se mezclen con otros.
    tenant_id           UUID NOT NULL,
    
    -- cedula_ciudadania, nit, nn, pasaporte, etc. (Fundamental para facturación).
    tipo_documento      document_type_enum NOT NULL,
    
    -- La cédula o NIT (Indexado para búsqueda rápida).
    numero_documento    VARCHAR NOT NULL,
    
    -- Nombre o Razón Social.
    nombre_completo     TEXT NOT NULL,
    
    -- Celular de contacto.
    telefono            VARCHAR,
    
    -- Para envío del PDF de la orden o resultados.
    correo              VARCHAR,
    
    -- Dirección de residencia o notificación.
    direccion           TEXT,

    -- Registro de creación en sistema.
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Registro de última edición.
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Para anulación o borrado lógico.
    deleted_at          TIMESTAMPTZ
);

-- ==========================================
-- 2. FOREIGN KEYS (Relaciones)
-- ==========================================

-- Relación con el tenant para aislamiento total.
ALTER TABLE public.personas
    ADD CONSTRAINT personas_tenant_id_fkey 
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- ==========================================
-- 3. CONSTRAINTS (Unicidad)
-- ==========================================

-- Evita duplicar la misma persona (Tipo + Número) dentro de un mismo CDA.
ALTER TABLE public.personas
    ADD CONSTRAINT personas_documento_tenant_key UNIQUE (tenant_id, tipo_documento, numero_documento);

-- ==========================================
-- 4. ÍNDICES (Rendimiento)
-- ==========================================

-- Búsqueda rápida por número de identificación (Fundamental para recepción).
CREATE INDEX IF NOT EXISTS personas_numero_documento_idx 
    ON public.personas USING btree (numero_documento);

-- Búsqueda por Tenant para RLS.
CREATE INDEX IF NOT EXISTS personas_tenant_idx 
    ON public.personas USING btree (tenant_id);

-- Búsqueda difusa por nombre.
CREATE INDEX IF NOT EXISTS personas_nombre_completo_trgm_idx 
    ON public.personas USING gin (nombre_completo gin_trgm_ops);

-- ==========================================
-- 5. GRANTS
-- ==========================================

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.personas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.personas TO service_role;


-- ==========================================
-- 6. RLS (Row Level Security) - personas
-- ==========================================

ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------
-- SELECT: Ver clientes/propietarios del CDA
-- ------------------------------------------
CREATE POLICY "select_personas_by_tenant"
ON public.personas
FOR SELECT
TO authenticated
USING (
    tenant_id IN (
        SELECT tp.tenant_id 
        FROM public.tenant_permissions tp
        JOIN public.service_users su ON su.id = tp.service_user_id
        WHERE su.auth_user_id = (SELECT auth.uid())
    )
);

-- ------------------------------------------
-- INSERT: Registrar nuevas personas
-- ------------------------------------------
CREATE POLICY "insert_personas_by_tenant"
ON public.personas
FOR INSERT
TO authenticated
WITH CHECK (
    tenant_id IN (
        SELECT tp.tenant_id 
        FROM public.tenant_permissions tp
        JOIN public.service_users su ON su.id = tp.service_user_id
        WHERE su.auth_user_id = (SELECT auth.uid())
    )
);

-- ------------------------------------------
-- UPDATE: Editar datos de contacto
-- ------------------------------------------
CREATE POLICY "update_personas_by_tenant"
ON public.personas
FOR UPDATE
TO authenticated
USING (
    tenant_id IN (
        SELECT tp.tenant_id 
        FROM public.tenant_permissions tp
        JOIN public.service_users su ON su.id = tp.service_user_id
        WHERE su.auth_user_id = (SELECT auth.uid())
    )
)
WITH CHECK (
    tenant_id IN (
        SELECT tp.tenant_id 
        FROM public.tenant_permissions tp
        JOIN public.service_users su ON su.id = tp.service_user_id
        WHERE su.auth_user_id = (SELECT auth.uid())
    )
);