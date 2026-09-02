-- ============================================================
-- 1. TARIFAS DE SERVICIOS POR TIPO DE VEHÍCULO
-- ============================================================

CREATE TABLE public.vehicle_service_rate (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tenant propietario de la tarifa.
    tenant_id UUID NOT NULL,

    -- Tipo de vehículo al que aplica la tarifa.
    vehicle_type public.vehicle_type_enum NOT NULL,

    -- Precio base del servicio para el tipo de vehículo.
    base_price NUMERIC(12,2) NOT NULL,

    -- Tipo de servicio al que corresponde la tarifa.
    service_type public.service_type_enum NOT NULL,

    -- Indica si la tarifa está actualmente disponible
    -- para ser utilizada en nuevas órdenes.
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    -- Registro de creación.
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Registro de última actualización.
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- ========================================================
    -- CONSTRAINTS
    -- ========================================================

    CONSTRAINT vehicle_service_rate_tenant_id_fkey
        FOREIGN KEY (tenant_id)
        REFERENCES public.tenants (id)
        ON DELETE CASCADE,

    CONSTRAINT vehicle_service_rate_base_price_check
        CHECK (base_price >= 0)

);


-- ============================================================
-- ÍNDICES ESTRATÉGICOS
-- ============================================================

-- Búsqueda de tarifas por tenant.
CREATE INDEX vehicle_service_rate_tenant_id_idx
ON public.vehicle_service_rate (tenant_id);

-- Búsqueda de tarifas activas por tenant.
CREATE INDEX vehicle_service_rate_tenant_active_idx
ON public.vehicle_service_rate (
    tenant_id,
    is_active
);

-- Búsqueda de una tarifa por tenant, tipo de vehículo
-- y tipo de servicio.
CREATE INDEX vehicle_service_rate_lookup_idx
ON public.vehicle_service_rate (
    tenant_id,
    vehicle_type,
    service_type
);


-- ============================================================
-- RESTRICCIÓN DE DUPLICADOS ACTIVOS
-- ============================================================

-- Un tenant no puede tener dos tarifas activas para la
-- misma combinación de tipo de vehículo y servicio.
CREATE UNIQUE INDEX vehicle_service_rate_active_unique_idx
ON public.vehicle_service_rate (
    tenant_id,
    vehicle_type,
    service_type
)
WHERE is_active = TRUE;


-- ============================================================
-- COMENTARIOS
-- ============================================================

COMMENT ON TABLE public.vehicle_service_rate IS
'Configuración de tarifas de servicios por tipo de vehículo y tenant. Define el precio base que se utilizará para nuevas órdenes de entrada.';

COMMENT ON COLUMN public.vehicle_service_rate.id IS
'Identificador único de la tarifa.';

COMMENT ON COLUMN public.vehicle_service_rate.tenant_id IS
'UUID del CDA / tenant propietario de la tarifa.';

COMMENT ON COLUMN public.vehicle_service_rate.vehicle_type IS
'Tipo de vehículo al que aplica la tarifa.';

COMMENT ON COLUMN public.vehicle_service_rate.base_price IS
'Precio base del servicio para el tipo de vehículo configurado.';

COMMENT ON COLUMN public.vehicle_service_rate.service_type IS
'Tipo de servicio al que corresponde la tarifa.';

COMMENT ON COLUMN public.vehicle_service_rate.is_active IS
'Indica si la tarifa puede utilizarse actualmente para nuevas órdenes.';

COMMENT ON COLUMN public.vehicle_service_rate.created_at IS
'Fecha y hora en que se creó la tarifa.';

COMMENT ON COLUMN public.vehicle_service_rate.updated_at IS
'Fecha y hora de la última actualización de la tarifa.';


-- ============================================================
-- GRANTS
-- ============================================================

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.vehicle_service_rate
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.vehicle_service_rate
TO service_role;


-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

ALTER TABLE public.vehicle_service_rate ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- SELECT: Solo puede consultar tarifas de los tenants
-- a los que pertenece el usuario.
-- ============================================================

CREATE POLICY "select_vehicle_service_rate_by_tenant"
ON public.vehicle_service_rate
FOR SELECT
TO authenticated
USING (
    tenant_id IN (
        SELECT public.get_my_tenants()
    )
);


-- ============================================================
-- INSERT: Solo puede crear tarifas para los tenants
-- a los que pertenece el usuario.
-- ============================================================

CREATE POLICY "insert_vehicle_service_rate_by_tenant"
ON public.vehicle_service_rate
FOR INSERT
TO authenticated
WITH CHECK (
    tenant_id IN (
        SELECT public.get_my_tenants()
    )
);


-- ============================================================
-- UPDATE: Solo puede modificar tarifas de los tenants
-- a los que pertenece el usuario.
-- ============================================================

CREATE POLICY "update_vehicle_service_rate_by_tenant"
ON public.vehicle_service_rate
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


-- ============================================================
-- DELETE: Solo puede eliminar tarifas de los tenants
-- a los que pertenece el usuario.
-- ============================================================

CREATE POLICY "delete_vehicle_service_rate_by_tenant"
ON public.vehicle_service_rate
FOR DELETE
TO authenticated
USING (
    tenant_id IN (
        SELECT public.get_my_tenants()
    )
);