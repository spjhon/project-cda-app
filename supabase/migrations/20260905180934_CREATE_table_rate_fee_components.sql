-- ============================================================
-- TABLA: rate_fee_components
-- ============================================================
-- Relaciona una tarifa de servicio vehicular con los fees
-- que componen dicha tarifa.
--
-- Ejemplo:
-- Una tarifa de RTM puede estar compuesta por:
--   - Fee de servicio
--   - Fee ANSV
--   - Otro concepto adicional
--
-- La tabla pertenece al tenant y cada relación conecta:
--   vehicle_service_rate → fee_types
-- ============================================================


-- ============================================================
-- 2. FEES ASIGNADOS A TARIFAS DE SERVICIOS
-- ============================================================

CREATE TABLE public.rate_fee_components (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tenant propietario de la relación.
    tenant_id UUID NOT NULL,

    -- Tarifa de servicio a la que se asigna el fee.
    vehicle_service_rate_id UUID NOT NULL,

    -- Fee específico del catálogo del tenant.
    --
    -- Cada registro de fee_types representa una versión
    -- concreta del fee, con su propio monto y rango de
    -- años de modelo.
    fee_types_id UUID NOT NULL,

    -- Registro de creación.
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Registro de última actualización.
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

 -- ========================================================
    -- CONSTRAINTS
    -- ========================================================

    -- El tenant debe existir.
    ALTER TABLE public.rate_fee_components
    ADD CONSTRAINT rate_fee_components_tenant_id_fkey
        FOREIGN KEY (tenant_id)
        REFERENCES public.tenants (id)
        ON DELETE CASCADE;

    -- La tarifa debe existir.
    --
    -- Relación con vehicle_service_rate.
    --Si eliminas una tarifa (vehicle_service_rate), sus relaciones en rate_fee_components desaparecen automáticamente.
    ALTER TABLE public.rate_fee_components
    ADD CONSTRAINT rate_fee_components_vehicle_service_rate_id_fkey
    FOREIGN KEY (vehicle_service_rate_id)
    REFERENCES public.vehicle_service_rate(id)
    ON DELETE CASCADE;

    -- El fee debe existir.
    --
    -- RESTRICT evita eliminar un fee_type que esté
    -- siendo utilizado por una tarifa.
    ALTER TABLE public.rate_fee_components
    ADD CONSTRAINT rate_fee_components_fee_type_id_fkey
        FOREIGN KEY (fee_types_id)
        REFERENCES public.fee_types (id)
        ON DELETE RESTRICT;


-- ============================================================
-- ÍNDICES ESTRATÉGICOS
-- ============================================================

-- Búsqueda de componentes por tenant.
CREATE INDEX rate_fee_components_tenant_id_idx
ON public.rate_fee_components (tenant_id);


-- Obtener todos los fees asociados a una tarifa.
CREATE INDEX rate_fee_components_vehicle_service_rate_id_idx
ON public.rate_fee_components (vehicle_service_rate_id);


-- Obtener todas las tarifas que utilizan un determinado fee.
CREATE INDEX rate_fee_components_fee_type_id_idx
ON public.rate_fee_components (fee_types_id);


-- ============================================================
-- COMENTARIOS
-- ============================================================

COMMENT ON TABLE public.rate_fee_components IS
'Relación entre las tarifas de servicios y los fees específicos asignados a cada tarifa. Cada fee referencia una versión concreta del catálogo de fee_types.';


COMMENT ON COLUMN public.rate_fee_components.id IS
'Identificador único de la relación entre la tarifa y el fee.';


COMMENT ON COLUMN public.rate_fee_components.tenant_id IS
'UUID del CDA / tenant propietario de la relación.';


COMMENT ON COLUMN public.rate_fee_components.vehicle_service_rate_id IS
'Identificador de la tarifa de servicio a la que pertenece el fee.';


COMMENT ON COLUMN public.rate_fee_components.fee_types_id IS
'Identificador del fee específico asignado a la tarifa. El monto, código, rango de años y demás información se obtiene desde fee_types.';


COMMENT ON COLUMN public.rate_fee_components.created_at IS
'Fecha y hora en que el fee fue asignado a la tarifa.';


COMMENT ON COLUMN public.rate_fee_components.updated_at IS
'Fecha y hora de la última actualización de la relación.';


-- ============================================================
-- GRANTS
-- ============================================================

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.rate_fee_components
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.rate_fee_components
TO service_role;


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.rate_fee_components ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- SELECT
-- Solo puede consultar relaciones de los tenants
-- a los que pertenece el usuario.
-- ============================================================

CREATE POLICY "select_rate_fee_components_by_tenant"
ON public.rate_fee_components
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

CREATE POLICY "insert_rate_fee_components_by_tenant"
ON public.rate_fee_components
FOR INSERT
TO authenticated
WITH CHECK (
    tenant_id IN (
        SELECT public.get_my_tenants()
    )
);


-- ============================================================
-- UPDATE
-- Solo puede modificar relaciones de los tenants
-- a los que pertenece el usuario.
-- ============================================================

CREATE POLICY "update_rate_fee_components_by_tenant"
ON public.rate_fee_components
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

CREATE POLICY "delete_rate_fee_components_by_tenant"
ON public.rate_fee_components
FOR DELETE
TO authenticated
USING (
    tenant_id IN (
        SELECT public.get_my_tenants()
    )
);


-- ============================================================
-- TRIGGER: UPDATED_AT
-- ============================================================

CREATE TRIGGER set_rate_fee_components_updated_at
BEFORE UPDATE
ON public.rate_fee_components
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();