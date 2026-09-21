-- ==========================================
-- RLS para entry_orders (DELETE)
-- ==========================================

CREATE POLICY "Users can delete entry orders from their allowed tenants"
ON public.entry_orders
FOR DELETE
TO authenticated
USING (
    tenant_id IN (
        SELECT tp.tenant_id
        FROM public.tenant_permissions tp
        JOIN public.service_users su
            ON su.id = tp.service_user_id
        WHERE su.auth_user_id = (SELECT auth.uid())
    )
);