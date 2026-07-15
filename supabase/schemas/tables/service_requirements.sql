-- =========================================================================
-- TABLA: service_requirements (Apta para Formulario de Landing)
-- =========================================================================



CREATE TABLE public.service_requirements (
    -- Identificadores
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Tenant (A qué CDA se le radica)
    tenant_id           UUID NOT NULL,

    -- Datos de contacto del remitente (Campos mapeados del Front)
    sender_name         TEXT NOT NULL,          -- Se llena con: nombreCompleto
    sender_email        TEXT NOT NULL,          -- Se llena con: correo
    sender_phone        TEXT,                   -- Se llena con: telefono
    
    -- Datos del Vehículo asociado (Opcional)
    placa               VARCHAR(10),            -- Se llena con: placa (Ej: "AAA123")

    -- Información del Requerimiento
    description         TEXT NOT NULL,          -- Se llena con: descripcion
    requirement_type    TEXT NOT NULL DEFAULT 'peticion', -- Se llena con: tipoTramite
    status              TEXT NOT NULL DEFAULT 'pendiente',
    

    -- Auditoría
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- FOREIGN KEYS (Relaciones)
-- ==========================================

ALTER TABLE public.service_requirements
    ADD CONSTRAINT service_requirements_tenant_id_fkey 
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- ==========================================
-- CONSTRAINTS (Validaciones)
-- ==========================================

-- Ajustamos la restricción de tipos para mapearla con lo que envías del Front
ALTER TABLE public.service_requirements
    ADD CONSTRAINT service_requirements_type_check 
    CHECK (requirement_type IN (
        'peticion', 
        'queja', 
        'apelacion', 
        'felicitacion'
    ));

ALTER TABLE public.service_requirements
    ADD CONSTRAINT service_requirements_status_check 
    CHECK (status IN (
        'pendiente', 
        'en_revision', 
        'resuelto',
        'nueva_revision',  
        'finalizado'
    ));



-- ==========================================
-- ÍNDICES (Rendimiento)
-- ==========================================

-- Indexación de placa para búsquedas cruzadas rápidas de requerimientos por vehículo
CREATE INDEX IF NOT EXISTS service_requirements_placa_idx 
    ON public.service_requirements USING btree (placa);

CREATE INDEX IF NOT EXISTS service_requirements_tenant_id_idx 
    ON public.service_requirements USING btree (tenant_id);

-- ==========================================
-- GRANTS & RLS (Mismo comportamiento seguro)
-- ==========================================

GRANT INSERT ON TABLE public.service_requirements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.service_requirements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.service_requirements TO service_role;



-- ==========================================
-- RLS
-- ==========================================


ALTER TABLE public.service_requirements ENABLE ROW LEVEL SECURITY;

-- 1. INSERT: Público desde Landing + Interno
CREATE POLICY "allow_anon_and_auth_insert_requirements"
ON public.service_requirements
FOR INSERT
TO anon, authenticated
WITH CHECK (
    (
        auth.role() = 'authenticated' AND 
        tenant_id IN (SELECT public.get_my_tenants())
    )
    OR
    (
        auth.role() = 'anon' 
    )
);

-- 2. SELECT: Solo personal del CDA
CREATE POLICY "select_requirements_by_tenant"
ON public.service_requirements
FOR SELECT
TO authenticated
USING (
    tenant_id IN (SELECT public.get_my_tenants())
);

-- 3. UPDATE: Solo personal del CDA para procesar
CREATE POLICY "update_requirements_by_tenant"
ON public.service_requirements
FOR UPDATE
TO authenticated
USING (
    tenant_id IN (SELECT public.get_my_tenants())
)
WITH CHECK (
    tenant_id IN (SELECT public.get_my_tenants())
);

