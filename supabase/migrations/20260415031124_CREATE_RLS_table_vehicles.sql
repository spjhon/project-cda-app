-- ==========================================
-- 6. RLS (Row Level Security) - vehicles
-- ==========================================

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------
-- SELECT: Ver vehículos registrados en el CDA
-- ------------------------------------------
CREATE POLICY "select_vehicles_by_tenant"
ON public.vehicles
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
-- INSERT: Registrar nuevos vehículos
-- ------------------------------------------
CREATE POLICY "insert_vehicles_by_tenant"
ON public.vehicles
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
-- UPDATE: Actualizar datos técnicos o vencimientos
-- ------------------------------------------
CREATE POLICY "update_vehicles_by_tenant"
ON public.vehicles
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