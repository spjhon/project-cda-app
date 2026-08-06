

-- ==========================================
-- POLÍTICAS DE EDICIÓN (UPDATE)
-- ==========================================

-- 2. Permitir actualizar saldos si el usuario pertenece al tenant 
-- (Opcionalmente filtrado por roles administrativos como 'aux_administrativo' o 'gerente')
CREATE POLICY "Authorized users can update tenant credits"
ON public.tenant_credits
FOR UPDATE
TO authenticated
USING (
  tenant_id IN (
    SELECT tp.tenant_id
    FROM public.tenant_permissions tp
    JOIN public.service_users su ON su.id = tp.service_user_id
    WHERE su.auth_user_id = (SELECT auth.uid())
      AND tp.role IN ('gerente', 'aux_administrativo', 'director_tecnico')
  )
)
WITH CHECK (
  tenant_id IN (
    SELECT tp.tenant_id
    FROM public.tenant_permissions tp
    JOIN public.service_users su ON su.id = tp.service_user_id
    WHERE su.auth_user_id = (SELECT auth.uid())
      AND tp.role IN ('gerente', 'aux_administrativo', 'director_tecnico')
  )
);