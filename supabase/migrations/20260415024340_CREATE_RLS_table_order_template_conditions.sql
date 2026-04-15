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