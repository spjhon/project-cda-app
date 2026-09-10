-- ============================================================
-- MIGRACIÓN: AGREGAR IVA A VEHICLE_SERVICE_RATE
-- ============================================================

ALTER TABLE public.vehicle_service_rate
ADD COLUMN iva_percentage NUMERIC(5,2) NULL;

-- ============================================================
-- VALIDAR RANGO DEL IVA
-- ============================================================

ALTER TABLE public.vehicle_service_rate
ADD CONSTRAINT vehicle_service_rate_iva_percentage_check
CHECK (
    iva_percentage IS NULL
    OR (
        iva_percentage >= 0
        AND iva_percentage <= 100
    )
);