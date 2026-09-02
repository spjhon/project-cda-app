-- ============================================================
-- 1. CONFIGURACIONES DE FEES
-- ============================================================

CREATE TABLE public.fee_types (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tenant propietario de la configuración del fee.
    tenant_id UUID NOT NULL,

    -- Nombre visible del fee.
    -- Ej: "ANSV", "SICOV", "Recaudo"
    name TEXT NOT NULL,

    -- Código interno que identifica el tipo de fee.
    -- Puede repetirse entre diferentes configuraciones/versiones.
    -- Ej: "ANSV", "SICOV", "RECAUDO"
    code TEXT NOT NULL,

    -- Descripción opcional del fee.
    description TEXT,

    -- Valor monetario del fee.
    fee_amount NUMERIC(12,2) NOT NULL,

    -- Porcentaje de IVA aplicable al fee.
-- Ej: 19.00 = 19%, 0.00 = sin IVA.
iva_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,

    -- Año inicial del modelo del vehículo al que aplica.
    -- NULL = aplica para cualquier año.
    model_year_from INTEGER,

    -- Año final del modelo del vehículo al que aplica.
    -- NULL = aplica para cualquier año.
    model_year_to INTEGER,

    -- Indica si esta configuración está disponible
    -- para ser asignada a nuevas tarifas.
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    -- Registro de creación.
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Registro de última actualización.
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- ========================================================
    -- CONSTRAINTS
    -- ========================================================

    CONSTRAINT fee_types_tenant_id_fkey
        FOREIGN KEY (tenant_id)
        REFERENCES public.tenants (id)
        ON DELETE CASCADE,

    -- El nombre no puede estar vacío.
    CONSTRAINT fee_types_name_check
        CHECK (length(trim(name)) > 0),

    -- El código no puede estar vacío.
    CONSTRAINT fee_types_code_check
        CHECK (length(trim(code)) > 0),

    -- El valor del fee no puede ser negativo.
    CONSTRAINT fee_types_fee_amount_check
        CHECK (fee_amount >= 0),

    -- Los años, cuando existen, deben ser válidos.
    CONSTRAINT fee_types_model_year_from_check
        CHECK (
            model_year_from IS NULL
            OR model_year_from >= 1900
        ),

    CONSTRAINT fee_types_model_year_to_check
        CHECK (
            model_year_to IS NULL
            OR model_year_to >= 1900
        ),

    -- Si existen ambos años, el inicial no puede ser
    -- posterior al final.
    CONSTRAINT fee_types_model_year_range_check
        CHECK (
            model_year_from IS NULL
            OR model_year_to IS NULL
            OR model_year_from <= model_year_to
        ),

        CONSTRAINT fee_types_iva_percentage_check
    CHECK (
        iva_percentage >= 0
        AND iva_percentage <= 100
    )
);


-- ============================================================
-- 2. ÍNDICES ESTRATÉGICOS
-- ============================================================

-- Búsqueda de configuraciones de fees por tenant.
CREATE INDEX fee_types_tenant_id_idx
ON public.fee_types (tenant_id);


-- Búsqueda de configuraciones activas por tenant.
CREATE INDEX fee_types_tenant_active_idx
ON public.fee_types (
    tenant_id,
    is_active
);


-- Búsqueda por tenant y código del fee.
-- Ej: encontrar todas las configuraciones SICOV
-- de un determinado tenant.
CREATE INDEX fee_types_tenant_code_idx
ON public.fee_types (
    tenant_id,
    code
);


-- Búsqueda de configuraciones por rango de años.
CREATE INDEX fee_types_model_year_idx
ON public.fee_types (
    tenant_id,
    model_year_from,
    model_year_to
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


COMMENT ON COLUMN public.fee_types.code IS
'Código interno que identifica el tipo de fee. Puede repetirse para representar diferentes configuraciones históricas del mismo fee.';


COMMENT ON COLUMN public.fee_types.description IS
'Descripción opcional de la configuración del fee.';


COMMENT ON COLUMN public.fee_types.fee_amount IS
'Valor monetario de la configuración del fee.';


COMMENT ON COLUMN public.fee_types.model_year_from IS
'Año inicial del modelo del vehículo al que aplica el fee. NULL indica que no existe límite inferior.';


COMMENT ON COLUMN public.fee_types.model_year_to IS
'Año final del modelo del vehículo al que aplica el fee. NULL indica que no existe límite superior.';


COMMENT ON COLUMN public.fee_types.is_active IS
'Indica si esta configuración del fee está actualmente disponible para ser asignada a nuevas tarifas.';


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