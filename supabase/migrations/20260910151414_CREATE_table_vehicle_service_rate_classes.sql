-- ============================================================
-- 1. TABLA: VEHICLE SERVICE RATE CLASSES
-- ============================================================

CREATE TABLE public.vehicle_service_rate_classes (

    -- Identificador único de la relación.
    id UUID NOT NULL DEFAULT gen_random_uuid(),

    -- Tenant propietario de la relación.
    tenant_id UUID NOT NULL,

    -- Tarifa de servicio a la que pertenece esta clase.
    vehicle_service_rate_id UUID NOT NULL,

    -- Clase de vehículo asociada a la tarifa.
    vehicle_class public.vehicle_class_enum NOT NULL,

    -- Registro de creación.
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Registro de última actualización.
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- ========================================================
    -- CONSTRAINTS
    -- ========================================================

    CONSTRAINT vehicle_service_rate_classes_pkey
        PRIMARY KEY (id),

    -- Una misma clase no puede aparecer dos veces
    -- dentro de la misma tarifa.
    CONSTRAINT vehicle_service_rate_classes_unique
        UNIQUE (vehicle_service_rate_id, vehicle_class),

    -- Relación con la tarifa.
    CONSTRAINT vehicle_service_rate_classes_rate_id_fkey
        FOREIGN KEY (vehicle_service_rate_id)
        REFERENCES public.vehicle_service_rate (id)
        ON DELETE CASCADE,

    -- Relación con el tenant.
    CONSTRAINT vehicle_service_rate_classes_tenant_id_fkey
        FOREIGN KEY (tenant_id)
        REFERENCES public.tenants (id)
        ON DELETE CASCADE

) TABLESPACE pg_default;


-- ============================================================
-- 2. ÍNDICES ESTRATÉGICOS
-- ============================================================

-- Búsqueda de clases por tenant.
CREATE INDEX IF NOT EXISTS
vehicle_service_rate_classes_tenant_id_idx
ON public.vehicle_service_rate_classes
USING btree (tenant_id);


-- Búsqueda de clases asociadas a una tarifa.
CREATE INDEX IF NOT EXISTS
vehicle_service_rate_classes_rate_id_idx
ON public.vehicle_service_rate_classes
USING btree (vehicle_service_rate_id);


-- ============================================================
-- 3. TRIGGER UPDATED_AT
-- ============================================================

CREATE TRIGGER set_vehicle_service_rate_classes_updated_at
BEFORE UPDATE ON public.vehicle_service_rate_classes
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 4. COMMENTS
-- ============================================================

COMMENT ON TABLE public.vehicle_service_rate_classes IS
'Relación entre una tarifa de servicio y las clases de vehículos a las que aplica.';


COMMENT ON COLUMN public.vehicle_service_rate_classes.id IS
'Identificador único de la relación entre la tarifa y la clase de vehículo.';


COMMENT ON COLUMN public.vehicle_service_rate_classes.tenant_id IS
'UUID del CDA / tenant propietario de la relación.';


COMMENT ON COLUMN public.vehicle_service_rate_classes.vehicle_service_rate_id IS
'UUID de la tarifa de servicio a la que pertenece la clase de vehículo.';


COMMENT ON COLUMN public.vehicle_service_rate_classes.vehicle_class IS
'Clase de vehículo a la que aplica la tarifa.';


COMMENT ON COLUMN public.vehicle_service_rate_classes.created_at IS
'Fecha y hora en que se creó la relación.';


COMMENT ON COLUMN public.vehicle_service_rate_classes.updated_at IS
'Fecha y hora de la última actualización de la relación.';


-- ============================================================
-- 5. GRANTS
-- ============================================================

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.vehicle_service_rate_classes
TO authenticated;


GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.vehicle_service_rate_classes
TO service_role;


-- ============================================================
-- 6. RLS
-- ============================================================

ALTER TABLE public.vehicle_service_rate_classes
ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- SELECT
-- Solo puede consultar clases de los tenants
-- a los que pertenece el usuario.
-- ============================================================

CREATE POLICY "select_vehicle_service_rate_classes_by_tenant"
ON public.vehicle_service_rate_classes
FOR SELECT
TO authenticated
USING (
    tenant_id IN (
        SELECT public.get_my_tenants()
    )
);


-- ============================================================
-- INSERT
-- Solo puede crear relaciones para los tenants
-- a los que pertenece el usuario.
-- ============================================================

CREATE POLICY "insert_vehicle_service_rate_classes_by_tenant"
ON public.vehicle_service_rate_classes
FOR INSERT
TO authenticated
WITH CHECK (
    tenant_id IN (
        SELECT public.get_my_tenants()
    )
);


-- ============================================================
-- UPDATE
-- Solo puede actualizar relaciones de los tenants
-- a los que pertenece el usuario.
-- ============================================================

CREATE POLICY "update_vehicle_service_rate_classes_by_tenant"
ON public.vehicle_service_rate_classes
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
-- Solo puede eliminar relaciones de los tenants
-- a los que pertenece el usuario.
-- ============================================================

CREATE POLICY "delete_vehicle_service_rate_classes_by_tenant"
ON public.vehicle_service_rate_classes
FOR DELETE
TO authenticated
USING (
    tenant_id IN (
        SELECT public.get_my_tenants()
    )
);