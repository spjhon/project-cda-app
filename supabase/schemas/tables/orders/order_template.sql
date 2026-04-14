-- ==========================================
-- 1. TIPOS ENUM (Definiciones previas)
-- ==========================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_type_enum') THEN
        CREATE TYPE vehicle_type_enum AS ENUM ('motocicleta', 'liviano', 'pesado', 'motocarro');
    END IF;
END $$;

-- ==========================================
-- 2. TABLA: order_template (Plantilla Orden de Entrada)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.order_template (
    -- Identificadores
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    
    -- Información de la Plantilla
    template_name       TEXT NOT NULL,
    version             INTEGER NOT NULL DEFAULT 1,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    
    -- Documentación Legal/SGC
    document_date       DATE NOT NULL DEFAULT CURRENT_DATE,
    document_code       TEXT NOT NULL,
    logo_url            TEXT,
    applies_to_vehicle  vehicle_type_enum NOT NULL,
    base_contract_text  TEXT,

    -- Auditoría
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    deleted_at          TIMESTAMPTZ
);

-- ==========================================
-- 3. FOREIGN KEYS (Relaciones)
-- ==========================================

-- Relación con el funcionario que crea la plantilla
ALTER TABLE public.order_template
    ADD CONSTRAINT order_template_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES public.service_users(id) ON DELETE SET NULL;


ALTER TABLE public.order_template 
    ADD CONSTRAINT order_template_tenant_id_fkey 
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- ==========================================
-- 4. CONSTRAINTS (Validaciones y Unicidad)
-- ==========================================

-- 1. Unicidad de Versión por Plantilla y Tenant
-- Evita que un mismo CDA tenga dos "v1" de la misma plantilla
ALTER TABLE public.order_template
    ADD CONSTRAINT order_template_name_version_tenant_key 
    UNIQUE (tenant_id, template_name, version);

-- 2. Validación de código de documento no vacío
ALTER TABLE public.order_template
    ADD CONSTRAINT order_template_document_code_check 
    CHECK (char_length(document_code) > 0);

-- ==========================================
-- 5. ÍNDICES (Rendimiento)
-- ==========================================

-- Búsqueda rápida por Tenant (Esencial para Multi-tenant)
CREATE INDEX IF NOT EXISTS order_template_tenant_id_idx 
    ON public.order_template USING btree (tenant_id);

-- Búsqueda por tipo de vehículo (Para filtrar en la recepción)
CREATE INDEX IF NOT EXISTS order_template_vehicle_type_idx 
    ON public.order_template USING btree (applies_to_vehicle);

-- Búsqueda por estado activo y no borrado
CREATE INDEX IF NOT EXISTS order_template_active_not_deleted_idx 
    ON public.order_template (is_active) 
    WHERE (deleted_at IS NULL);

-- Búsqueda difusa por nombre de plantilla
CREATE INDEX IF NOT EXISTS order_template_name_trgm_idx 
    ON public.order_template USING gin (template_name gin_trgm_ops);

-- ==========================================
-- 6. COMENTARIOS DE DOCUMENTACIÓN
-- ==========================================

COMMENT ON TABLE public.order_template IS 'Configuración maestra de las plantillas de orden de entrada para el SGC. v1.0';
COMMENT ON COLUMN public.order_template.is_active IS 'Indica si la plantilla está disponible para nuevas órdenes.';
COMMENT ON COLUMN public.order_template.version IS 'Número incremental para control de cambios inmutables.';
COMMENT ON COLUMN public.order_template.base_contract_text IS 'Texto legal/contrato que se copiará como snapshot a la orden.';

-- ==========================================
-- 7. GRANTS
-- ==========================================

-- Permiso para role authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.order_template TO authenticated;

-- Permiso para el service role
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.order_template TO service_role;