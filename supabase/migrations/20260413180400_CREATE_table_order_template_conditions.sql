-- ==========================================
-- 1. TIPOS ENUM (Definición de respuestas)
-- ==========================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'condition_response_enum') THEN
        CREATE TYPE condition_response_enum AS ENUM ('cumple', 'no_cumple', 'no_aplica');
    END IF;
END $$;

-- ==========================================
-- 2. TABLA: order_template_conditions
-- ==========================================

CREATE TABLE IF NOT EXISTS public.order_template_conditions (
    -- Identificadores
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL, -- Agregado para aislamiento directo
    order_template_id       UUID NOT NULL,
    
    -- Configuración de la Pregunta/Condición
    label                   TEXT NOT NULL,
    is_special              BOOLEAN NOT NULL DEFAULT false,
    special_condition_label TEXT,
    default_value           condition_response_enum NOT NULL DEFAULT 'no_aplica',
    
    -- UI y Ordenamiento
    visual_order            INTEGER NOT NULL DEFAULT 0,

    -- Auditoría
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at              TIMESTAMPTZ
);

-- ==========================================
-- 3. FOREIGN KEYS (Relaciones)
-- ==========================================

ALTER TABLE public.order_template_conditions
    ADD CONSTRAINT order_template_conditions_template_id_fkey 
    FOREIGN KEY (order_template_id) REFERENCES public.order_template(id) ON DELETE CASCADE;

ALTER TABLE public.order_template_conditions
    ADD CONSTRAINT order_template_conditions_tenant_id_fkey 
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- ==========================================
-- 4. CONSTRAINTS (Validaciones)
-- ==========================================

-- 1. Si es una condición especial, debería tener un label descriptivo
ALTER TABLE public.order_template_conditions
    ADD CONSTRAINT special_condition_label_check 
    CHECK (
        (is_special = false) OR 
        (is_special = true AND special_condition_label IS NOT NULL)
    );

-- ==========================================
-- 5. ÍNDICES (Rendimiento)
-- ==========================================

-- Búsqueda rápida de condiciones por plantilla
CREATE INDEX IF NOT EXISTS order_template_conditions_template_idx 
    ON public.order_template_conditions USING btree (order_template_id);

-- Índice para cargar las preguntas en el orden correcto (Frontend)
CREATE INDEX IF NOT EXISTS order_template_conditions_sorting_idx 
    ON public.order_template_conditions (order_template_id, visual_order)
    WHERE (deleted_at IS NULL);

-- ==========================================
-- 6. COMENTARIOS DE DOCUMENTACIÓN
-- ==========================================

COMMENT ON TABLE public.order_template_conditions IS 'Preguntas o ítems de inspección asociados a una plantilla específica.';
COMMENT ON COLUMN public.order_template_conditions.is_special IS 'Define si la condición requiere un campo adicional (ej: checkbox de disco de freno).';
COMMENT ON COLUMN public.order_template_conditions.visual_order IS 'Determina la posición en la interfaz de usuario.';

-- ==========================================
-- 7. GRANTS
-- ==========================================

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.order_template_conditions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.order_template_conditions TO service_role;