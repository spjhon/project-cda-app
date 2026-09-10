
-- ============================================================
-- TABLA: VEHICLE_SERVICE_RATE_FUELS
-- ============================================================
--
-- Define los tipos de combustible aplicables a una tarifa.
--
-- Un rate puede tener múltiples combustibles.
-- Un combustible no puede repetirse dentro del mismo rate.
--
-- La relación con el tenant se mantiene directamente en esta
-- tabla para facilitar las consultas y políticas RLS.
-- ============================================================

CREATE TABLE public.vehicle_service_rate_fuels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tenant_id UUID NOT NULL,

    vehicle_service_rate_id UUID NOT NULL,

    fuel_type public.fuel_type_enum NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- ========================================================
    -- RELACIÓN CON TENANT
    -- ========================================================

    CONSTRAINT vehicle_service_rate_fuels_tenant_id_fkey
        FOREIGN KEY (tenant_id)
        REFERENCES public.tenants (id)
        ON DELETE CASCADE,

    -- ========================================================
    -- RELACIÓN CON EL RATE
    -- ========================================================

    CONSTRAINT vehicle_service_rate_fuels_rate_id_fkey
        FOREIGN KEY (vehicle_service_rate_id)
        REFERENCES public.vehicle_service_rate (id)
        ON DELETE CASCADE,

    -- ========================================================
    -- EVITAR COMBUSTIBLES REPETIDOS EN EL MISMO RATE
    -- ========================================================

    CONSTRAINT vehicle_service_rate_fuels_unique
        UNIQUE (
            vehicle_service_rate_id,
            fuel_type
        )
);


-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE public.vehicle_service_rate_fuels IS
'Define los tipos de combustible aplicables a cada tarifa de servicio. Un rate puede tener múltiples combustibles, pero un mismo combustible no puede repetirse dentro de la misma tarifa.';

COMMENT ON COLUMN public.vehicle_service_rate_fuels.id IS
'Identificador único de la relación entre la tarifa y el tipo de combustible.';

COMMENT ON COLUMN public.vehicle_service_rate_fuels.tenant_id IS
'Identificador del tenant propietario de la relación. Se mantiene directamente para facilitar el aislamiento multi-tenant y las políticas RLS.';

COMMENT ON COLUMN public.vehicle_service_rate_fuels.vehicle_service_rate_id IS
'Identificador de la tarifa de servicio a la que aplica el combustible.';

COMMENT ON COLUMN public.vehicle_service_rate_fuels.fuel_type IS
'Tipo de combustible aplicable a la tarifa. Utiliza el enum fuel_type_enum.';

COMMENT ON COLUMN public.vehicle_service_rate_fuels.created_at IS
'Fecha y hora en que se creó la relación entre la tarifa y el tipo de combustible.';

COMMENT ON CONSTRAINT vehicle_service_rate_fuels_unique
ON public.vehicle_service_rate_fuels IS
'Evita que un mismo tipo de combustible sea asociado más de una vez a la misma tarifa.';


-- ============================================================
-- ÍNDICES
-- ============================================================

-- Facilita las consultas y filtros por tenant.
CREATE INDEX vehicle_service_rate_fuels_tenant_id_idx
ON public.vehicle_service_rate_fuels (
    tenant_id
);


-- Facilita obtener rápidamente todos los combustibles
-- asociados a una tarifa.
--
-- NOTA:
-- No se crea un índice adicional sobre
-- (vehicle_service_rate_id, fuel_type), porque la restricción
-- UNIQUE vehicle_service_rate_fuels_unique ya crea ese índice
-- automáticamente.
CREATE INDEX vehicle_service_rate_fuels_rate_id_idx
ON public.vehicle_service_rate_fuels (
    vehicle_service_rate_id
);


-- ============================================================
-- PERMISOS
-- ============================================================

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.vehicle_service_rate_fuels
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.vehicle_service_rate_fuels
TO service_role;


-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE public.vehicle_service_rate_fuels
ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- SELECT
-- ============================================================

CREATE POLICY "Users can view their tenant rate fuels"
ON public.vehicle_service_rate_fuels
FOR SELECT
TO authenticated
USING (
    tenant_id IN (
        SELECT public.get_my_tenants()
    )
);


-- ============================================================
-- INSERT
-- ============================================================

CREATE POLICY "Users can insert their tenant rate fuels"
ON public.vehicle_service_rate_fuels
FOR INSERT
TO authenticated
WITH CHECK (
    tenant_id IN (
        SELECT public.get_my_tenants()
    )
);


-- ============================================================
-- UPDATE
-- ============================================================

CREATE POLICY "Users can update their tenant rate fuels"
ON public.vehicle_service_rate_fuels
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
-- DELETE
-- ============================================================

CREATE POLICY "Users can delete their tenant rate fuels"
ON public.vehicle_service_rate_fuels
FOR DELETE
TO authenticated
USING (
    tenant_id IN (
        SELECT public.get_my_tenants()
    )
);
