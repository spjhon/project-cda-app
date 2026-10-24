-- ============================================================
-- TABLA: VEHICLE_SERVICE_RATE_COMPANIES
-- ============================================================
--
-- Define las empresas asociadas a una tarifa de servicio.
--
-- Un rate puede estar asociado a múltiples empresas.
-- Una empresa no puede repetirse dentro del mismo rate.
--
-- La relación con el tenant se mantiene directamente en esta
-- tabla para facilitar las consultas y políticas RLS.
-- ============================================================

CREATE TABLE public.vehicle_service_rate_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tenant_id UUID NOT NULL,

    vehicle_service_rate_id UUID NOT NULL,

    company_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- ========================================================
    -- RELACIÓN CON TENANT
    -- ========================================================

    CONSTRAINT vehicle_service_rate_companies_tenant_id_fkey
        FOREIGN KEY (tenant_id)
        REFERENCES public.tenants (id)
        ON DELETE CASCADE,

    -- ========================================================
    -- RELACIÓN CON EL RATE
    -- ========================================================

    CONSTRAINT vehicle_service_rate_companies_rate_id_fkey
        FOREIGN KEY (vehicle_service_rate_id)
        REFERENCES public.vehicle_service_rate (id)
        ON DELETE CASCADE,

    -- ========================================================
    -- RELACIÓN CON LA EMPRESA
    -- ========================================================

    CONSTRAINT vehicle_service_rate_companies_company_id_fkey
        FOREIGN KEY (company_id)
        REFERENCES public.tenants_company (id)
        ON DELETE CASCADE,

    -- ========================================================
    -- EVITAR EMPRESAS REPETIDAS EN EL MISMO RATE
    -- ========================================================

    CONSTRAINT vehicle_service_rate_companies_unique
        UNIQUE (
            vehicle_service_rate_id,
            company_id
        )
);


-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE public.vehicle_service_rate_companies IS
'Define las empresas asociadas a cada tarifa de servicio. Un rate puede estar asociado a múltiples empresas, pero una misma empresa no puede repetirse dentro de la misma tarifa.';

COMMENT ON COLUMN public.vehicle_service_rate_companies.id IS
'Identificador único de la relación entre la tarifa y la empresa.';

COMMENT ON COLUMN public.vehicle_service_rate_companies.tenant_id IS
'Identificador del tenant propietario de la relación. Se mantiene directamente para facilitar el aislamiento multi-tenant y las políticas RLS.';

COMMENT ON COLUMN public.vehicle_service_rate_companies.vehicle_service_rate_id IS
'Identificador de la tarifa de servicio asociada a la empresa.';

COMMENT ON COLUMN public.vehicle_service_rate_companies.company_id IS
'Identificador de la empresa asociada a la tarifa de servicio.';

COMMENT ON COLUMN public.vehicle_service_rate_companies.created_at IS
'Fecha y hora en que se creó la relación entre la tarifa y la empresa.';

COMMENT ON COLUMN public.vehicle_service_rate_companies.updated_at IS
'Fecha y hora de la última actualización de la relación.';

COMMENT ON CONSTRAINT vehicle_service_rate_companies_unique
ON public.vehicle_service_rate_companies IS
'Evita que una misma empresa sea asociada más de una vez a la misma tarifa.';


-- ============================================================
-- ÍNDICES
-- ============================================================

-- Facilita las consultas y filtros por tenant.
CREATE INDEX vehicle_service_rate_companies_tenant_id_idx
ON public.vehicle_service_rate_companies (
    tenant_id
);

-- Facilita obtener las empresas asociadas a una tarifa.
CREATE INDEX vehicle_service_rate_companies_rate_id_idx
ON public.vehicle_service_rate_companies (
    vehicle_service_rate_id
);

-- Facilita consultar las tarifas asociadas a una empresa.
CREATE INDEX vehicle_service_rate_companies_company_id_idx
ON public.vehicle_service_rate_companies (
    company_id
);


-- ============================================================
-- PERMISOS
-- ============================================================

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.vehicle_service_rate_companies
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.vehicle_service_rate_companies
TO service_role;


-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE public.vehicle_service_rate_companies
ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- SELECT
-- ============================================================

CREATE POLICY "Users can view their tenant rate companies"
ON public.vehicle_service_rate_companies
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

CREATE POLICY "Users can insert their tenant rate companies"
ON public.vehicle_service_rate_companies
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

CREATE POLICY "Users can update their tenant rate companies"
ON public.vehicle_service_rate_companies
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

CREATE POLICY "Users can delete their tenant rate companies"
ON public.vehicle_service_rate_companies
FOR DELETE
TO authenticated
USING (
    tenant_id IN (
        SELECT public.get_my_tenants()
    )
);