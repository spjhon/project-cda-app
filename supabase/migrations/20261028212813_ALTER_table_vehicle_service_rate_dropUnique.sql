
-- Elimina la restricción que impide tener varias tarifas
-- activas para la misma combinación de tenant, vehículo y servicio.
DROP INDEX IF EXISTS public.vehicle_service_rate_active_unique_idx;