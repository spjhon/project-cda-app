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