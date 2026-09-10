-- ============================================================
-- MIGRACIÓN: AGREGAR UPDATED_AT A VEHICLE_SERVICE_RATE_FUELS
-- ============================================================

ALTER TABLE public.vehicle_service_rate_fuels
ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();