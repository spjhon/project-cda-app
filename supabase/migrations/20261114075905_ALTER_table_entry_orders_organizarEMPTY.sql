-- ============================================================
-- Cambiar vehiculo_clase_snapshot y vehiculo_combustible_snapshot
-- de NOT NULL DEFAULT '' a NULL sin DEFAULT.
-- ============================================================
-- Motivo: permitir que estas columnas queden NULL cuando no se
-- conozca el dato (ej. migraciones de Excel sin esa información).
-- Al quitar el DEFAULT, las filas nuevas no se rellenan con '',
-- y al quitar NOT NULL, se aceptan NULLs explícitos.
-- ============================================================

ALTER TABLE public.entry_orders
    ALTER COLUMN vehiculo_clase_snapshot DROP DEFAULT,
    ALTER COLUMN vehiculo_clase_snapshot DROP NOT NULL,
    ALTER COLUMN vehiculo_combustible_snapshot DROP DEFAULT,
    ALTER COLUMN vehiculo_combustible_snapshot DROP NOT NULL;