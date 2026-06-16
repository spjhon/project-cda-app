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

    -- ==========================================
    -- IDENTIFICADORES Y RELACIONES
    -- ==========================================

    -- Identificador único global.
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Indispensable para separar los datos de cada CDA.
    tenant_id                   UUID NOT NULL,

    -- Vehículo asociado a la orden.
    vehiculo_id                 UUID NOT NULL,

    -- Propietario registrado al momento de crear la orden.
    propietario_id              UUID NOT NULL,

    -- Persona que presenta el vehículo.
    cliente_id                  UUID NOT NULL,

    -- Funcionario que recibe el vehículo.
    funcionario_id              UUID NOT NULL,

    -- Plantilla utilizada para generar la orden.
    plantilla_id                UUID NOT NULL,


    -- ==========================================
    -- DATOS PRINCIPALES DE LA ORDEN
    -- ==========================================

    -- Fecha y hora exacta de creación.
    fecha                       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Consecutivo visible para el cliente.
    consecutivo                 INTEGER NOT NULL,

    -- Indica si proviene de una reinspección.
    es_reinspeccion             BOOLEAN DEFAULT FALSE,

    -- Tipo de servicio solicitado.
    service_type                public.service_type_enum NOT NULL DEFAULT 'RTM'::public.service_type_enum,

    -- Estado actual de la orden.
    estado_orden                public.order_status_enum NOT NULL DEFAULT 'abierta'::public.order_status_enum,


    -- ==========================================
    -- SNAPSHOT DEL VEHÍCULO
    -- ==========================================

    -- Placa registrada al momento de crear la orden.
    vehiculo_placa_snapshot                     VARCHAR NOT NULL,

    -- Marca del vehículo.
    vehiculo_marca_snapshot                     VARCHAR NOT NULL,

    -- Línea del vehículo.
    vehiculo_linea_snapshot                     VARCHAR NOT NULL,

    -- Modelo del vehículo.
    vehiculo_modelo_snapshot                    INTEGER NOT NULL,

    -- Color registrado.
    vehiculo_color_snapshot                     VARCHAR NOT NULL,

    -- Tipo de vehículo.
    vehiculo_tipo_snapshot                      public.vehicle_type_enum NOT NULL,

    -- Clase del vehículo.
    vehiculo_clase_snapshot                     VARCHAR NOT NULL,

    -- Tipo de combustible.
    vehiculo_combustible_snapshot               VARCHAR NOT NULL,

    -- Cilindraje registrado.
    vehiculo_cilindrada_snapshot                INTEGER NOT NULL,

    -- Indica si posee blindaje.
    vehiculo_blindaje_snapshot                  BOOLEAN NOT NULL,

    -- Capacidad máxima de pasajeros.
    vehiculo_capacidad_pasajeros_snapshot       INTEGER NOT NULL,

    -- Vehículo de enseñanza.
    vehiculo_es_ensenanza_snapshot              BOOLEAN NOT NULL,

    -- Particular, público, oficial, etc.
    vehiculo_tipo_servicio_snapshot             public.vehicle_service_type_enum NOT NULL,

    -- Vehículo extranjero.
    vehiculo_es_extranjero_snapshot             BOOLEAN NOT NULL,


    -- ==========================================
    -- SNAPSHOT DEL PROPIETARIO
    -- ==========================================

    -- Tipo de documento del propietario.
    propietario_tipo_documento_snapshot         TEXT NOT NULL,

    -- Número de documento del propietario.
    propietario_numero_documento_snapshot       VARCHAR NOT NULL,

    -- Nombre completo del propietario.
    propietario_nombre_snapshot                 TEXT NOT NULL,

    -- Teléfono del propietario.
    propietario_telefono_snapshot               VARCHAR,

    -- Correo electrónico del propietario.
    propietario_email_snapshot                  TEXT,

    -- Dirección registrada.
    propietario_direccion_snapshot              TEXT,


    -- ==========================================
    -- SNAPSHOT DEL CLIENTE
    -- ==========================================

    -- Tipo de documento de quien presenta el vehículo.
    cliente_tipo_documento_snapshot             TEXT NOT NULL,

    -- Número de documento.
    cliente_numero_documento_snapshot           VARCHAR NOT NULL,

    -- Nombre completo.
    cliente_nombre_snapshot                     TEXT NOT NULL,

    -- Teléfono de contacto.
    cliente_telefono_snapshot                   VARCHAR,

    -- Correo electrónico.
    cliente_email_snapshot                      TEXT,

    -- Dirección registrada.
    cliente_direccion_snapshot                  TEXT,


    -- ==========================================
    -- SNAPSHOT DEL FUNCIONARIO
    -- ==========================================

    -- Tipo de documento del funcionario.
    funcionario_tipo_documento_snapshot         TEXT NOT NULL,

    -- Número de documento.
    funcionario_numero_documento_snapshot       VARCHAR NOT NULL,

    -- Nombre completo.
    funcionario_nombre_snapshot                 TEXT NOT NULL,

    -- Firma digital utilizada para la recepción.
    funcionario_firma_base64_snapshot           TEXT NOT NULL,


    -- ==========================================
    -- SNAPSHOTS DOCUMENTALES
    -- ==========================================

    -- Fecha de vencimiento del SOAT al momento del ingreso.
    soat_vencimiento_snapshot                   DATE,

    -- Número del certificado de gas.
    gas_numero_snapshot                         VARCHAR,

    -- Fecha de vencimiento del certificado de gas.
    gas_vencimiento_snapshot                    DATE,


    -- ==========================================
    -- DATOS OPERATIVOS
    -- ==========================================

    -- Lectura del odómetro al ingreso.
    kilometraje                                 VARCHAR,

    -- Observaciones generales registradas por recepción.
    observaciones                               TEXT,

    -- ==========================================
    -- INFORMACION DE OFICINA (QUE VIENE DESDE OFICINA)
    -- ==========================================

    oficina_pin character varying,
    oficina_pago numeric(12,2),
    oficina_consecutivo_factura character varying,
    oficina_tipo_pago public.office_payment_type_enum,
    se_compro_soat boolean,
    resultado_revision text,

    -- ==========================================
    -- AUDITORÍA
    -- ==========================================

    -- Fecha de creación del registro.
    created_at                                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Fecha de última modificación.
    updated_at                                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Soft delete.
    deleted_at                                  TIMESTAMPTZ

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

-- Índice para búsquedas por factura (Cuadres de caja, reportes de ingresos)
CREATE INDEX IF NOT EXISTS entry_orders_oficina_factura_tenant_idx 
ON public.entry_orders USING btree (tenant_id, oficina_consecutivo_factura) 
TABLESPACE pg_default;

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