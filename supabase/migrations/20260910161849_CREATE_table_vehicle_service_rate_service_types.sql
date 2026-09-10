-- ============================================================
-- TABLA: vehicle_service_rate_service_types
-- ============================================================
--
-- Relaciona una tarifa de servicio con los tipos de servicio
-- de vehículo a los que aplica.
--
-- Ejemplo:
-- Una tarifa puede aplicar a:
--   - particular
--   - oficial
--   - publico
--
-- Un mismo tipo no puede repetirse dentro de una tarifa.
-- ============================================================

CREATE TABLE public.vehicle_service_rate_service_types (
    id UUID NOT NULL DEFAULT gen_random_uuid(),

    tenant_id UUID NOT NULL,

    vehicle_service_rate_id UUID NOT NULL,

    service_type public.vehicle_service_type_enum NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT vehicle_service_rate_service_types_pkey
        PRIMARY KEY (id),

    CONSTRAINT vehicle_service_rate_service_types_unique
        UNIQUE (vehicle_service_rate_id, service_type),

    CONSTRAINT vehicle_service_rate_service_types_rate_id_fkey
        FOREIGN KEY (vehicle_service_rate_id)
        REFERENCES public.vehicle_service_rate (id)
        ON DELETE CASCADE,

    CONSTRAINT vehicle_service_rate_service_types_tenant_id_fkey
        FOREIGN KEY (tenant_id)
        REFERENCES public.tenants (id)
        ON DELETE CASCADE
) TABLESPACE pg_default;


-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS
vehicle_service_rate_service_types_tenant_id_idx
ON public.vehicle_service_rate_service_types
USING btree (tenant_id);


CREATE INDEX IF NOT EXISTS
vehicle_service_rate_service_types_rate_id_idx
ON public.vehicle_service_rate_service_types
USING btree (vehicle_service_rate_id);


-- ============================================================
-- TRIGGER: updated_at
-- ============================================================

CREATE TRIGGER set_vehicle_service_rate_service_types_updated_at
BEFORE UPDATE
ON public.vehicle_service_rate_service_types
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- COMENTARIOS
-- ============================================================

COMMENT ON TABLE public.vehicle_service_rate_service_types IS
'Relación entre una tarifa de servicio y los tipos de servicio de vehículo a los que aplica.';


COMMENT ON COLUMN public.vehicle_service_rate_service_types.id IS
'Identificador único de la relación entre la tarifa y el tipo de servicio de vehículo.';


COMMENT ON COLUMN public.vehicle_service_rate_service_types.tenant_id IS
'UUID del CDA / tenant propietario de la relación.';


COMMENT ON COLUMN public.vehicle_service_rate_service_types.vehicle_service_rate_id IS
'UUID de la tarifa de servicio a la que pertenece el tipo de servicio de vehículo.';


COMMENT ON COLUMN public.vehicle_service_rate_service_types.service_type IS
'Tipo de servicio de vehículo al que aplica la tarifa.';


COMMENT ON COLUMN public.vehicle_service_rate_service_types.created_at IS
'Fecha y hora en que se creó la relación.';


COMMENT ON COLUMN public.vehicle_service_rate_service_types.updated_at IS
'Fecha y hora de la última actualización de la relación.';


-- ============================================================
-- GRANTS
-- ============================================================

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.vehicle_service_rate_service_types
TO authenticated;


GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.vehicle_service_rate_service_types
TO service_role;


-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE public.vehicle_service_rate_service_types
ENABLE ROW LEVEL SECURITY;


CREATE POLICY "select_vehicle_service_rate_service_types_by_tenant"
ON public.vehicle_service_rate_service_types
FOR SELECT
TO authenticated
USING (
    tenant_id IN (
        SELECT public.get_my_tenants()
    )
);


CREATE POLICY "insert_vehicle_service_rate_service_types_by_tenant"
ON public.vehicle_service_rate_service_types
FOR INSERT
TO authenticated
WITH CHECK (
    tenant_id IN (
        SELECT public.get_my_tenants()
    )
);


CREATE POLICY "update_vehicle_service_rate_service_types_by_tenant"
ON public.vehicle_service_rate_service_types
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


CREATE POLICY "delete_vehicle_service_rate_service_types_by_tenant"
ON public.vehicle_service_rate_service_types
FOR DELETE
TO authenticated
USING (
    tenant_id IN (
        SELECT public.get_my_tenants()
    )
);