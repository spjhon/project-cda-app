-- ============================================================
-- MIGRACIÓN: CAMBIAR RANGO DE AÑOS POR RANGO DE ANTIGÜEDAD
-- ============================================================

-- ============================================================
-- 1. ELIMINAR CONSTRAINTS ANTERIORES
-- ============================================================

ALTER TABLE public.fee_types
DROP CONSTRAINT IF EXISTS fee_types_model_year_from_check;

ALTER TABLE public.fee_types
DROP CONSTRAINT IF EXISTS fee_types_model_year_to_check;

ALTER TABLE public.fee_types
DROP CONSTRAINT IF EXISTS fee_types_model_year_range_check;


-- ============================================================
-- 2. ELIMINAR ÍNDICE ANTERIOR
-- ============================================================

DROP INDEX IF EXISTS public.fee_types_model_year_idx;


-- ============================================================
-- 3. ELIMINAR COLUMNAS ANTERIORES
-- ============================================================

ALTER TABLE public.fee_types
DROP COLUMN IF EXISTS model_year_from;

ALTER TABLE public.fee_types
DROP COLUMN IF EXISTS model_year_to;


-- ============================================================
-- 4. AGREGAR COLUMNAS DE ANTIGÜEDAD
-- ============================================================

ALTER TABLE public.fee_types
ADD COLUMN vehicle_age_from INTEGER;

ALTER TABLE public.fee_types
ADD COLUMN vehicle_age_to INTEGER;


-- ============================================================
-- 5. CONSTRAINTS DE ANTIGÜEDAD
-- ============================================================

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


-- ============================================================
-- 6. ÍNDICE PARA BÚSQUEDA POR ANTIGÜEDAD
-- ============================================================

CREATE INDEX fee_types_vehicle_age_idx
ON public.fee_types (
    vehicle_service_rate_id,
    vehicle_age_from,
    vehicle_age_to
);


-- ============================================================
-- 7. COMENTARIOS
-- ============================================================

COMMENT ON COLUMN public.fee_types.vehicle_age_from IS
'Años mínimos de antigüedad del vehículo a los que aplica el fee. NULL indica que no existe límite inferior.';

COMMENT ON COLUMN public.fee_types.vehicle_age_to IS
'Años máximos de antigüedad del vehículo a los que aplica el fee. NULL indica que no existe límite superior.';