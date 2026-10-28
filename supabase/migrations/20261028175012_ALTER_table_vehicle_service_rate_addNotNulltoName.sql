-- ==========================================
-- MIGRACIÓN: HACER OBLIGATORIO EL NOMBRE
-- ==========================================

BEGIN;

ALTER TABLE public.vehicle_service_rate
ALTER COLUMN name SET NOT NULL;

COMMIT;