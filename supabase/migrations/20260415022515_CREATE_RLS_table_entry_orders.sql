-- ==========================================
-- 7. RLS para entry_orders (CREATE)
-- ==========================================

alter table public.entry_orders enable row level security;


-- POLÍTICA: Permite a los funcionarios crear órdenes de entrada solo en sus tenants autorizados
CREATE POLICY "Users can create entry orders for their allowed tenants"
ON public.entry_orders
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


-- POLÍTICA: Permite ver las órdenes de entrada de los tenants donde el usuario tiene permisos
CREATE POLICY "Users can see entry orders from their allowed tenants"
ON public.entry_orders
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


-- POLÍTICA: Permite actualizar órdenes existentes, validando que sigan perteneciendo al tenant
CREATE POLICY "Users can update entry orders from their allowed tenants"
ON public.entry_orders
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