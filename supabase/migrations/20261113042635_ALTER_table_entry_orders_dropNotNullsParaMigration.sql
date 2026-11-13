-- ============================================================
-- DROP de columnas obsoletas en public.entry_orders
-- ============================================================

ALTER TABLE public.entry_orders
  DROP COLUMN IF EXISTS vehiculo_modelo_snapshot,
  DROP COLUMN IF EXISTS vehiculo_clase_snapshot,
  DROP COLUMN IF EXISTS vehiculo_combustible_snapshot;