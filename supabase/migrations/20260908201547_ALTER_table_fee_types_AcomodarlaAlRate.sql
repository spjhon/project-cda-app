-- ============================================================
-- 1. ELIMINAR COLUMNAS OBSOLETAS
-- ============================================================

ALTER TABLE public.fee_types
DROP COLUMN code;

ALTER TABLE public.fee_types
DROP COLUMN is_active;


-- ============================================================
-- 2. AGREGAR RELACIÓN CON LA TARIFA
-- ============================================================

ALTER TABLE public.fee_types
ADD COLUMN vehicle_service_rate_id UUID;


-- ============================================================
-- 3. CREAR FOREIGN KEY
-- ============================================================

ALTER TABLE public.fee_types
ADD CONSTRAINT fee_types_vehicle_service_rate_id_fkey
FOREIGN KEY (vehicle_service_rate_id)
REFERENCES public.vehicle_service_rate (id)
ON DELETE RESTRICT;


-- ============================================================
-- 4. HACER OBLIGATORIA LA RELACIÓN
-- ============================================================

ALTER TABLE public.fee_types
ALTER COLUMN vehicle_service_rate_id SET NOT NULL;


-- ============================================================
-- 5. ELIMINAR ÍNDICE DE AÑOS ANTERIOR
-- ============================================================

DROP INDEX public.fee_types_model_year_idx;


-- ============================================================
-- 6. CREAR ÍNDICE PARA LA NUEVA RELACIÓN
-- ============================================================

CREATE INDEX fee_types_rate_model_year_idx
ON public.fee_types (
    vehicle_service_rate_id,
    model_year_from,
    model_year_to
);