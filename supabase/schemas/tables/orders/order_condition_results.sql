CREATE TABLE IF NOT EXISTS public.order_condition_results (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL,
    entry_order_id          UUID NOT NULL,
    -- Referencia a la pregunta original
    template_condition_id   UUID NOT NULL,
    
    -- El resultado marcado por el inspector
    value                   condition_response_enum NOT NULL,
   
    
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ocr_tenant_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id),
    CONSTRAINT ocr_order_fkey FOREIGN KEY (entry_order_id) REFERENCES public.entry_orders(id) ON DELETE CASCADE
);



-- ==========================================
-- ÍNDICES PARA order_condition_results
-- ==========================================

-- Para cargar instantáneamente todos los resultados de una orden específica
CREATE INDEX IF NOT EXISTS ocr_order_id_idx 
    ON public.order_condition_results (entry_order_id);

-- Para que el RLS y el aislamiento por CDA sea ultra veloz
CREATE INDEX IF NOT EXISTS ocr_tenant_id_idx 
    ON public.order_condition_results (tenant_id);



-- ==========================================
-- 5. GRANTS
-- ==========================================
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.order_condition_results TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.order_condition_results TO service_role;


-- ==========================================
-- 1. HABILITAR RLS: order_condition_results
-- ==========================================
ALTER TABLE public.order_condition_results ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 2. RLS: SELECT
-- ==========================================
-- POLÍTICA: Permite ver los resultados de condiciones asociados a sus tenants autorizados
CREATE POLICY "Users can see condition results from their allowed tenants"
ON public.order_condition_results
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
-- POLÍTICA: Permite registrar resultados de condiciones solo para sus propios tenants
CREATE POLICY "Users can create condition results for their allowed tenants"
ON public.order_condition_results
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
-- POLÍTICA: Permite modificar resultados existentes sin cambiar de tenant
CREATE POLICY "Users can update condition results from their allowed tenants"
ON public.order_condition_results
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