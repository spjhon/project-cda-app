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
-- 5. ÍNDICES (Rendimiento y Seguridad)
-- ==========================================

-- 1. Aislamiento Multi-tenant (Vital para RLS)
-- Este resuelve el Issue de Supabase sobre la foreign key del tenant.
CREATE INDEX IF NOT EXISTS otc_tenant_id_idx 
    ON public.order_template_conditions (tenant_id);

-- 2. Índice Compuesto y Parcial (EL MÁS IMPORTANTE PARA EL FRONTEND)
-- Este índice hace tres cosas a la vez:
--   a) Cubre la relación con la plantilla (reemplaza a los otros dos duplicados).
--   b) Ordena los datos por 'visual_order' directamente en el disco.
--   c) Ignora registros borrados (WHERE deleted_at IS NULL), siendo más ligero.
CREATE INDEX IF NOT EXISTS otc_template_sorting_idx 
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


-- ==========================================
-- 1. HABILITAR RLS: order_template_conditions
-- ==========================================
ALTER TABLE public.order_template_conditions ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 2. RLS: SELECT
-- ==========================================
-- POLÍTICA: Permite ver los ítems de las plantillas de sus tenants autorizados
CREATE POLICY "Users can see template conditions from their allowed tenants"
ON public.order_template_conditions
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

-- ==========================================
-- 3. RLS: INSERT (CREATE)
-- ==========================================
-- POLÍTICA: Permite crear ítems de plantilla vinculados a sus propios tenants
CREATE POLICY "Users can create template conditions for their allowed tenants"
ON public.order_template_conditions
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

-- ==========================================
-- 4. RLS: UPDATE
-- ==========================================
-- POLÍTICA: Permite modificar los ítems de plantilla existentes del tenant
CREATE POLICY "Users can update template conditions from their allowed tenants"
ON public.order_template_conditions
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