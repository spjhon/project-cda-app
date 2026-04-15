-- ==========================================
-- 6. RLS (Row Level Security) - personas
-- ==========================================

ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------
-- SELECT: Ver clientes/propietarios del CDA
-- ------------------------------------------
CREATE POLICY "select_personas_by_tenant"
ON public.personas
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
-- INSERT: Registrar nuevas personas
-- ------------------------------------------
CREATE POLICY "insert_personas_by_tenant"
ON public.personas
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
-- UPDATE: Editar datos de contacto
-- ------------------------------------------
CREATE POLICY "update_personas_by_tenant"
ON public.personas
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