-- ============================================================
-- MIGRACIÓN: CAMBIAR FK DE FEE_TYPES
-- ============================================================

ALTER TABLE public.fee_types
DROP CONSTRAINT IF EXISTS fee_types_vehicle_service_rate_id_fkey;

ALTER TABLE public.fee_types
ADD CONSTRAINT fee_types_vehicle_service_rate_id_fkey
FOREIGN KEY (vehicle_service_rate_id)
REFERENCES public.vehicle_service_rate (id)
ON DELETE CASCADE;