-- ==========================================
-- MIGRACIÓN: AGREGAR NOMBRE A LAS TARIFAS
-- ==========================================

BEGIN;

ALTER TABLE public.vehicle_service_rate
ADD COLUMN name text;

COMMENT ON COLUMN public.vehicle_service_rate.name
IS 'Nombre descriptivo de la tarifa del servicio vehicular.';

COMMIT;