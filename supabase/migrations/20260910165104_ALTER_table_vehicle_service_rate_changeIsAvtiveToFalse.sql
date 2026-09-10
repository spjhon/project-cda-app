-- ============================================================
-- CAMBIAR VALOR POR DEFECTO DE is_active
-- ============================================================
--
-- Las nuevas tarifas se crearán inicialmente como inactivas.
-- Esto no modifica el estado de las tarifas existentes.
-- ============================================================

ALTER TABLE public.vehicle_service_rate
ALTER COLUMN is_active SET DEFAULT FALSE;