-- ------------------------------------------
-- DELETE: Eliminar plantillas de forma permanente
-- ------------------------------------------
CREATE POLICY "delete_order_template_by_tenant"
ON public.order_template
FOR DELETE
TO authenticated
USING (
    tenant_id IN (
        SELECT tp.tenant_id 
        FROM public.tenant_permissions tp
        JOIN public.service_users su ON su.id = tp.service_user_id
        WHERE su.auth_user_id = (SELECT auth.uid())
    )
);