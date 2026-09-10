-- ============================================================
-- 1. CONFIGURACIONES DE FEES
-- ============================================================

CREATE TABLE public.fee_types (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tenant propietario de la configuración del fee.
    tenant_id UUID NOT NULL,

    vehicle_service_rate_id UUID NOT NULL

    -- Nombre visible del fee.
    -- Ej: "ANSV", "SICOV", "Recaudo"
    name TEXT NOT NULL,

    -- Descripción opcional del fee.
    description TEXT,

    -- Valor monetario del fee.
    fee_amount NUMERIC(12,2) NOT NULL,

    -- Porcentaje de IVA aplicable al fee.
-- Ej: 19.00 = 19%, 0.00 = sin IVA.
iva_percentage NUMERIC(5,2),

  
    model_year_from INTEGER,
    vehicle_age_from INTEGER,



    vehicle_age_to INTEGER,


    -- Registro de creación.
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Registro de última actualización.
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- ========================================================
    -- CONSTRAINTS
    -- ========================================================

ALTER TABLE public.fee_types
ADD CONSTRAINT fee_types_vehicle_service_rate_id_fkey
FOREIGN KEY (vehicle_service_rate_id)
REFERENCES public.vehicle_service_rate (id)
ON DELETE CASCADE;


    CONSTRAINT fee_types_tenant_id_fkey
        FOREIGN KEY (tenant_id)
        REFERENCES public.tenants (id)
        ON DELETE CASCADE,

    -- El nombre no puede estar vacío.
    CONSTRAINT fee_types_name_check
        CHECK (length(trim(name)) > 0),

    -- El valor del fee no puede ser negativo.
    CONSTRAINT fee_types_fee_amount_check
        CHECK (fee_amount >= 0),


ALTER TABLE public.fee_types
ADD CONSTRAINT fee_types_vehicle_age_from_check
CHECK (
    vehicle_age_from IS NULL
    OR vehicle_age_from >= 0
);

ALTER TABLE public.fee_types
ADD CONSTRAINT fee_types_vehicle_age_to_check
CHECK (
    vehicle_age_to IS NULL
    OR vehicle_age_to >= 0
);

ALTER TABLE public.fee_types
ADD CONSTRAINT fee_types_vehicle_age_range_check
CHECK (
    vehicle_age_from IS NULL
    OR vehicle_age_to IS NULL
    OR vehicle_age_from <= vehicle_age_to
);



        CONSTRAINT fee_types_iva_percentage_check
     CHECK (
            iva_percentage IS NULL
            OR (
                iva_percentage >= 0
                AND iva_percentage <= 100
            )
        );
);


-- ============================================================
-- 2. ÍNDICES ESTRATÉGICOS
-- ============================================================

-- Búsqueda de fees por tenant.
CREATE INDEX fee_types_tenant_id_idx
ON public.fee_types (tenant_id);


-- Búsqueda de fees asociados a un rate específico.
CREATE INDEX fee_types_vehicle_service_rate_id_idx
ON public.fee_types (vehicle_service_rate_id);


CREATE INDEX fee_types_vehicle_age_idx
ON public.fee_types (
    vehicle_service_rate_id,
    vehicle_age_from,
    vehicle_age_to
);

-- ============================================================
-- 3. RESTRICCIÓN DE DUPLICADOS
-- ============================================================

-- NO se crea una restricción UNIQUE sobre:
--
--     (tenant_id, code)
--
-- porque un tenant puede tener varias configuraciones
-- históricas del mismo fee.
--
-- Ejemplo:
--
-- SICOV 2025 → $9.500 → inactive
-- SICOV 2026 → $11.000 → active
--
-- Ambos pueden tener:
--
-- code = 'SICOV'


-- ============================================================
-- 4. COMENTARIOS
-- ============================================================

COMMENT ON TABLE public.fee_types IS
'Configuraciones de fees disponibles para ser asignadas a tarifas de servicios. Cada registro representa una configuración/version específica de un fee, permitiendo conservar su histórico.';


COMMENT ON COLUMN public.fee_types.id IS
'Identificador único de la configuración del fee.';


COMMENT ON COLUMN public.fee_types.tenant_id IS
'UUID del CDA / tenant propietario de la configuración del fee.';


COMMENT ON COLUMN public.fee_types.name IS
'Nombre visible del fee. Ej: ANSV, SICOV, Recaudo.';


COMMENT ON COLUMN public.fee_types.description IS
'Descripción opcional de la configuración del fee.';


COMMENT ON COLUMN public.fee_types.fee_amount IS
'Valor monetario de la configuración del fee.';


COMMENT ON COLUMN public.fee_types.vehicle_age_from IS
'Años mínimos de antigüedad del vehículo a los que aplica el fee. NULL indica que no existe límite inferior.';

COMMENT ON COLUMN public.fee_types.vehicle_age_to IS
'Años máximos de antigüedad del vehículo a los que aplica el fee. NULL indica que no existe límite superior.';


COMMENT ON COLUMN public.fee_types.created_at IS
'Fecha y hora en que se creó la configuración del fee.';


COMMENT ON COLUMN public.fee_types.updated_at IS
'Fecha y hora de la última actualización de la configuración del fee.';

COMMENT ON COLUMN public.fee_types.iva_percentage IS
'Porcentaje de IVA aplicable al fee. Ej: 19.00 representa 19%.';


-- ============================================================
-- 5. GRANTS
-- ============================================================

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.fee_types
TO authenticated;


GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.fee_types
TO service_role;


-- ============================================================
-- 6. RLS (Row Level Security)
-- ============================================================

ALTER TABLE public.fee_types ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- SELECT
-- Solo puede consultar fees de los tenants
-- a los que pertenece el usuario.
-- ============================================================

CREATE POLICY "select_fee_types_by_tenant"
ON public.fee_types
FOR SELECT
TO authenticated
USING (
    tenant_id IN (
        SELECT public.get_my_tenants()
    )
);


-- ============================================================
-- INSERT
-- Solo puede crear fees para los tenants
-- a los que pertenece el usuario.
-- ============================================================

CREATE POLICY "insert_fee_types_by_tenant"
ON public.fee_types
FOR INSERT
TO authenticated
WITH CHECK (
    tenant_id IN (
        SELECT public.get_my_tenants()
    )
);


-- ============================================================
-- DELETE
-- Solo puede eliminar fees de los tenants
-- a los que pertenece el usuario.
-- ============================================================

CREATE POLICY "delete_fee_types_by_tenant"
ON public.fee_types
FOR DELETE
TO authenticated
USING (
    tenant_id IN (
        SELECT public.get_my_tenants()
    )
);

-- ============================================================
-- UPDATE
-- Solo puede actualizar fees de los tenants
-- a los que pertenece el usuario.
-- ============================================================

CREATE POLICY "update_fee_types_by_tenant"
ON public.fee_types
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