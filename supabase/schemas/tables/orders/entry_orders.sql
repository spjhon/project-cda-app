-- ==========================================
-- 1. TIPOS ENUM (Estados y Servicios)
-- ==========================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status_enum') THEN
        CREATE TYPE order_status_enum AS ENUM ('abierta', 'en_prueba', 'finalizada', 'anulada');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_type_enum') THEN
        CREATE TYPE service_type_enum AS ENUM ('RTM', 'preventiva', 'peritaje', 'otro');
    END IF;
END $$;

-- ==========================================
-- 2. TABLA: entry_orders
-- ==========================================

CREATE TABLE IF NOT EXISTS public.entry_orders (
    -- Identificador único global.
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Indispensable para separar los datos de cada CDA.
    tenant_id                   UUID NOT NULL,
    
    -- El número que ve el cliente (ej: 0001, 0002).
    consecutivo                 SERIAL,
    
    -- Fecha y hora exacta de la creación.
    fecha                       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- tipo de servicio
    service_type                service_type_enum NOT NULL DEFAULT 'RTM',
    
    -- Referencia al vehículo.
    vehiculo_id                 UUID NOT NULL,
    
    -- Referencia al dueño actual.
    propietario_id              UUID NOT NULL,
    
    -- Quien trae el vehículo (puede ser diferente al dueño).
    cliente_id                  UUID NOT NULL,
    
    -- El recepcionista que atiende (Referencia a service_users).
    funcionario_id              UUID NOT NULL,
    
    -- La plantilla de inspección que se usó.
    plantilla_id                UUID NOT NULL,
    
    -- El valor que marca el odómetro.
    kilometraje                 VARCHAR,
    
    -- Indica si viene por rechazo previo.
    es_reinspeccion             BOOLEAN DEFAULT false,
    
    -- Notas generales del estado del vehículo.
    observaciones               TEXT,
    
    -- 'abierta', 'en_prueba', 'finalizada', 'anulada'.
    estado_orden                order_status_enum NOT NULL DEFAULT 'abierta',
    
    -- Fecha del SOAT al momento de entrar.
    soat_vencimiento_snapshot   DATE,
    
    -- Número de certificado de gas al momento de entrar.
    gas_numero_snapshot         VARCHAR,
    
    -- Fecha de certificado de gas al momento de entrar.
    gas_vencimiento_snapshot    DATE,
    
    -- El contrato legal exacto que firmó ese día.
    texto_contractual_snapshot  TEXT,

    -- Registro de creación en sistema.
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Registro de última edición.
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Para anular la orden sin borrarla físicamente.
    deleted_at                  TIMESTAMPTZ
);

-- ==========================================
-- 3. FOREIGN KEYS (Relaciones)
-- ==========================================

ALTER TABLE public.entry_orders
    ADD CONSTRAINT entry_orders_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.entry_orders
    ADD CONSTRAINT entry_orders_vehiculo_id_fkey FOREIGN KEY (vehiculo_id) REFERENCES public.vehicles(id);

ALTER TABLE public.entry_orders
    ADD CONSTRAINT entry_orders_propietario_id_fkey FOREIGN KEY (propietario_id) REFERENCES public.personas(id);

ALTER TABLE public.entry_orders
    ADD CONSTRAINT entry_orders_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.personas(id);

ALTER TABLE public.entry_orders
    ADD CONSTRAINT entry_orders_plantilla_id_fkey FOREIGN KEY (plantilla_id) REFERENCES public.order_template(id);

-- Nota: funcionario_id referencia a tu tabla de usuarios del sistema
ALTER TABLE public.entry_orders
    ADD CONSTRAINT entry_orders_funcionario_id_fkey FOREIGN KEY (funcionario_id) REFERENCES public.service_users(id);


-- ==========================================
-- 4. COMENTARIOS
-- ==========================================


COMMENT ON COLUMN public.entry_orders.service_type IS 'Tipo de servicio legal o comercial asociado a esta orden de entrada';

-- ==========================================
-- 5. CONSTRAINTS (Unicidad)
-- ==========================================

-- El consecutivo debe ser único por cada CDA (Tenant)
ALTER TABLE public.entry_orders
    ADD CONSTRAINT entry_orders_consecutivo_tenant_key UNIQUE (tenant_id, consecutivo);

-- ==========================================
-- 6. ÍNDICES (Rendimiento)
-- ==========================================

-- Búsquedas por fecha (Reportes)
CREATE INDEX IF NOT EXISTS entry_orders_fecha_idx ON public.entry_orders (fecha);

-- Aislamiento RLS
CREATE INDEX IF NOT EXISTS entry_orders_tenant_idx ON public.entry_orders (tenant_id);

-- Búsqueda de historial por vehículo
CREATE INDEX IF NOT EXISTS entry_orders_vehiculo_idx ON public.entry_orders (vehiculo_id);

-- Índices para mejorar el rendimiento de búsquedas y reportes
CREATE INDEX IF NOT EXISTS entry_orders_cliente_id_idx 
    ON public.entry_orders (cliente_id);

CREATE INDEX IF NOT EXISTS entry_orders_propietario_id_idx 
    ON public.entry_orders (propietario_id);

-- Para filtrar por el inspector/funcionario que realizó la orden
CREATE INDEX IF NOT EXISTS entry_orders_funcionario_id_idx 
    ON public.entry_orders (funcionario_id);

-- Para reportes por tipo de plantilla (ej: cuántas de Livianos vs Motos)
CREATE INDEX IF NOT EXISTS entry_orders_plantilla_id_idx 
    ON public.entry_orders (plantilla_id);

-- Crear un índice para optimizar búsquedas por tipo de servicio
-- Útil para reportes (ej: "¿Cuántas RTM se hicieron este mes?")
CREATE INDEX IF NOT EXISTS entry_orders_service_type_idx 
ON public.entry_orders USING btree (service_type);

-- ==========================================
-- 7. GRANTS
-- ==========================================

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.entry_orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.entry_orders TO service_role;


-- ==========================================
-- 8. RLS para entry_orders (CREATE)
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