-- ==========================================
-- 1. TABLA: entry_order_tire_pressures
-- ==========================================

CREATE TABLE IF NOT EXISTS public.entry_order_tire_pressures (
    -- Identificador único global.
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Indispensable para separar los datos de cada CDA.
    tenant_id               UUID NOT NULL,
    
    -- Referencia a la orden de entrada específica.
    entry_order_id          UUID NOT NULL,
    
    -- Ej: 1, 2, 3... (Útil para ordenar visualmente).
    eje                     INTEGER NOT NULL,
    
    -- Ej: 'izquierda', 'derecha', 'izquierda interior', 'derecha interior'.
    posicion                VARCHAR NOT NULL,
    
    -- La medida inicial tomada por el inspector.
    presion_encontrada      NUMERIC,
    
    -- Si el cliente la infló/desinfló, se registra aquí el nuevo valor.
    presion_ajustada        NUMERIC,
    
    -- Indica si la medida corresponde a la llanta de auxilio.
    es_repuesto             BOOLEAN DEFAULT false,

    -- Registro de creación en sistema.
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Registro de última edición.
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Para anulación o borrado lógico.
    deleted_at              TIMESTAMPTZ
);

-- ==========================================
-- 2. FOREIGN KEYS (Relaciones)
-- ==========================================

-- Relación con el tenant
ALTER TABLE public.entry_order_tire_pressures
    ADD CONSTRAINT tire_pressures_tenant_id_fkey 
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Relación con la orden (si la orden se borra, las presiones también)
ALTER TABLE public.entry_order_tire_pressures
    ADD CONSTRAINT tire_pressures_order_id_fkey 
    FOREIGN KEY (entry_order_id) REFERENCES public.entry_orders(id) ON DELETE CASCADE;

-- ==========================================
-- 3. ÍNDICES (Rendimiento)
-- ==========================================

-- Búsqueda rápida por orden para mostrar en el formulario de inspección.
CREATE INDEX IF NOT EXISTS tire_pressures_order_idx 
    ON public.entry_order_tire_pressures (entry_order_id)
    WHERE (deleted_at IS NULL);

-- Aislamiento RLS.
CREATE INDEX IF NOT EXISTS tire_pressures_tenant_idx 
    ON public.entry_order_tire_pressures USING btree (tenant_id);

-- ==========================================
-- 4. GRANTS
-- ==========================================

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.entry_order_tire_pressures TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.entry_order_tire_pressures TO service_role;

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