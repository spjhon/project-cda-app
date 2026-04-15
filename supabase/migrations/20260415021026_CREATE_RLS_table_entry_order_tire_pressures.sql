-- ==========================================
-- 5. RLS (Row Level Security)
-- ==========================================

alter table public.entry_order_tire_pressures enable row level security;


-- POLÍTICA: Permite a los miembros del tenant crear registros de presión de llantas
CREATE POLICY "Users can create tire pressures for their allowed tenants"
ON public.entry_order_tire_pressures
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




-- POLÍTICA: Solo los miembros del tenant pueden ver, escribir y hacer update a las presiones de las llantas
create policy "Users can see tire pressures from their allowed tenants"
on public.entry_order_tire_pressures
for select
to authenticated
USING (
    tenant_id IN (
        SELECT tp.tenant_id 
        FROM public.tenant_permissions tp
        JOIN public.service_users su ON su.id = tp.service_user_id
        WHERE su.auth_user_id = (SELECT auth.uid())
    )
);




-- POLÍTICA: Permite a los miembros del tenant actualizar las presiones de llantas existentes
CREATE POLICY "Users can update tire pressures from their allowed tenants"
ON public.entry_order_tire_pressures
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