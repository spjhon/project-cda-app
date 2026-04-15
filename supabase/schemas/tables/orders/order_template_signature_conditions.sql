-- ==========================================
-- 1. TABLA: order_template_signature_conditions
-- ==========================================

CREATE TABLE IF NOT EXISTS public.order_template_signature_conditions (
    -- Identificadores
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   UUID NOT NULL,
    order_template_signature_id UUID NOT NULL,
    
    -- Configuración de la Declaración
    declaration_text            TEXT NOT NULL,
    
    
    -- Auditoría
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at                  TIMESTAMPTZ
);

-- ==========================================
-- 2. FOREIGN KEYS (Relaciones)
-- ==========================================

ALTER TABLE public.order_template_signature_conditions
    ADD CONSTRAINT signature_conditions_signature_id_fkey 
    FOREIGN KEY (order_template_signature_id) 
    REFERENCES public.order_template_signatures(id) ON DELETE CASCADE;

ALTER TABLE public.order_template_signature_conditions
    ADD CONSTRAINT signature_conditions_tenant_id_fkey 
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- ==========================================
-- 3. ÍNDICES (Rendimiento)
-- ==========================================

CREATE INDEX IF NOT EXISTS signature_conditions_tenant_idx 
    ON public.order_template_signature_conditions USING btree (tenant_id);

CREATE INDEX IF NOT EXISTS signature_conditions_parent_idx 
    ON public.order_template_signature_conditions (order_template_signature_id)
    WHERE (deleted_at IS NULL);

-- ==========================================
-- 4. COMENTARIOS DE DOCUMENTACIÓN
-- ==========================================

COMMENT ON TABLE public.order_template_signature_conditions IS 'Textos de aceptación legal vinculados a una firma. Todos son obligatorios por defecto.';

-- ==========================================
-- 5. GRANTS
-- ==========================================

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.order_template_signature_conditions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.order_template_signature_conditions TO service_role;


-- ==========================================
-- 1. HABILITAR RLS: order_template_signature_conditions
-- ==========================================
ALTER TABLE public.order_template_signature_conditions ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 2. RLS: SELECT
-- ==========================================
-- POLÍTICA: Permite ver la relación entre firmas y condiciones de sus tenants autorizados
CREATE POLICY "Users can see template signature conditions from their allowed tenants"
ON public.order_template_signature_conditions
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
-- POLÍTICA: Permite crear relaciones firma-condición para sus propios tenants
CREATE POLICY "Users can create template signature conditions for their allowed tenants"
ON public.order_template_signature_conditions
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
-- POLÍTICA: Permite actualizar las relaciones existentes dentro del mismo tenant
CREATE POLICY "Users can update template signature conditions from their allowed tenants"
ON public.order_template_signature_conditions
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