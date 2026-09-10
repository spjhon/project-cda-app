-- ============================================================
-- TRIGGER: updated_at
-- ============================================================

CREATE TRIGGER set_vehicle_service_rate_service_types_updated_at
BEFORE UPDATE
ON public.vehicle_service_rate_service_types
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();