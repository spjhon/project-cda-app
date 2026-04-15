
-- ==========================================
-- 8. RLS (Row Level Security) - order_template
-- ==========================================

ALTER TABLE public.order_template ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------
-- SELECT: Ver las plantillas del CDA
-- ------------------------------------------
CREATE POLICY "select_order_template_by_tenant"
ON public.order_template
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

-- ------------------------------------------
-- INSERT: Crear nuevas plantillas
-- ------------------------------------------
CREATE POLICY "insert_order_template_by_tenant"
ON public.order_template
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

-- ------------------------------------------
-- UPDATE: Editar plantillas existentes
-- ------------------------------------------
CREATE POLICY "update_order_template_by_tenant"
ON public.order_template
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