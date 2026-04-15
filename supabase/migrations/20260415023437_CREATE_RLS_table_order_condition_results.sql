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