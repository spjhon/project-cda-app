-- Permite actualizar fees únicamente pertenecientes a un tenant
-- al que el usuario autenticado tiene acceso.

CREATE POLICY "update_fee_types_by_tenant"
ON public.fee_types
FOR UPDATE
TO authenticated
USING (
    tenant_id IN (
        SELECT public.get_my_tenants()
    )
)
WITH CHECK (
    tenant_id IN (
        SELECT public.get_my_tenants()
    )
);