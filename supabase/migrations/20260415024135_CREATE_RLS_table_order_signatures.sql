-- ==========================================
-- 1. HABILITAR RLS: order_signatures
-- ==========================================
ALTER TABLE public.order_signatures ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 2. RLS: SELECT
-- ==========================================
-- POLÍTICA: Permite ver las firmas asociadas a los tenants autorizados
CREATE POLICY "Users can see order signatures from their allowed tenants"
ON public.order_signatures
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
-- POLÍTICA: Permite registrar firmas solo para sus propios tenants
CREATE POLICY "Users can create order signatures for their allowed tenants"
ON public.order_signatures
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
-- 4. RLS: UPDATE (order_signatures)
-- ==========================================

-- POLÍTICA: Permite actualizar registros de firmas, validando la pertenencia al tenant
CREATE POLICY "Users can update order signatures from their allowed tenants"
ON public.order_signatures
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