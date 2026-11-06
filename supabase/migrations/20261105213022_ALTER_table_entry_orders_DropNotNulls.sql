BEGIN;

-- =========================================================
-- PERMITIR ÓRDENES SIN CLIENTE, PROPIETARIO O PLANTILLA
-- =========================================================

ALTER TABLE public.entry_orders
    ALTER COLUMN cliente_id DROP NOT NULL,
    ALTER COLUMN propietario_id DROP NOT NULL,
    ALTER COLUMN plantilla_id DROP NOT NULL;


-- =========================================================
-- SNAPSHOTS DEL VEHÍCULO
-- =========================================================

ALTER TABLE public.entry_orders
    ALTER COLUMN vehiculo_color_snapshot DROP NOT NULL,
    ALTER COLUMN vehiculo_cilindrada_snapshot DROP NOT NULL,
    ALTER COLUMN vehiculo_capacidad_pasajeros_snapshot DROP NOT NULL;


-- =========================================================
-- SNAPSHOTS DEL PROPIETARIO
-- =========================================================

ALTER TABLE public.entry_orders
    ALTER COLUMN propietario_tipo_documento_snapshot DROP NOT NULL,
    ALTER COLUMN propietario_numero_documento_snapshot DROP NOT NULL,
    ALTER COLUMN propietario_nombre_snapshot DROP NOT NULL;


-- =========================================================
-- SNAPSHOTS DEL CLIENTE
-- =========================================================

ALTER TABLE public.entry_orders
    ALTER COLUMN cliente_tipo_documento_snapshot DROP NOT NULL,
    ALTER COLUMN cliente_numero_documento_snapshot DROP NOT NULL,
    ALTER COLUMN cliente_nombre_snapshot DROP NOT NULL;

COMMIT;