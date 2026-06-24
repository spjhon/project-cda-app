-- =========================================================================
-- MIGRACIÓN: CAMPOS DE CONTROL PARA REINSPECCIONES EN ENTRY_ORDERS
-- =========================================================================

-- 1. Agregar las nuevas columnas de control de flujo
ALTER TABLE public.entry_orders 
  ADD COLUMN id_reprobado UUID NULL,
  ADD COLUMN id_orden_reinspeccion UUID NULL;

-- 2. Crear la restricción de Llave Foránea Autorreferencial (Self-Referencing FK)
-- Vincula 'id_reprobado' hacia la misma tabla para heredar la integridad.
ALTER TABLE public.entry_orders
  ADD CONSTRAINT entry_orders_id_reprobado_fkey 
  FOREIGN KEY (id_reprobado) 
  REFERENCES public.entry_orders(id) 
  ON DELETE SET NULL;

-- Nota: No añadimos FK estricta a 'id_orden_reinspeccion' para evitar 
-- relaciones circulares infinitas durante los inserts concurrentes.

-- 3. Crear índices optimizados para las búsquedas del RPC y TanStack
CREATE INDEX IF NOT EXISTS entry_orders_id_reprobado_idx 
  ON public.entry_orders USING btree (id_reprobado)
  WHERE id_reprobado IS NOT NULL;

CREATE INDEX IF NOT EXISTS entry_orders_id_orden_reinspeccion_idx 
  ON public.entry_orders USING btree (id_orden_reinspeccion)
  WHERE id_orden_reinspeccion IS NOT NULL;

-- 4. Documentación del esquema en Postgres
COMMENT ON COLUMN public.entry_orders.id_reprobado IS 'Se llena en la REINSPECCIÓN. Guarda el UUID de la orden original que fue rechazada.';
COMMENT ON COLUMN public.entry_orders.id_orden_reinspeccion IS 'Se llena en la ORDEN ORIGINAL (Opcional/Históricos). Guarda el UUID de la orden que actuó como su reinspección.';


-- =========================================================================
-- ANEXO MIGRACIÓN: COLUMNA DE CONTROL DE VENCIMIENTO (15 DÍAS)
-- =========================================================================

-- 1. Agregar la columna de fecha límite para la reinspección
ALTER TABLE public.entry_orders 
  ADD COLUMN fecha_limite_reinspeccion DATE NULL;

-- 2. Crear un índice para búsquedas rápidas por expiración
CREATE INDEX IF NOT EXISTS entry_orders_fecha_limite_reinspeccion_idx 
  ON public.entry_orders USING btree (fecha_limite_reinspeccion)
  WHERE fecha_limite_reinspeccion IS NOT NULL;

-- 3. Documentación del campo
COMMENT ON COLUMN public.entry_orders.fecha_limite_reinspeccion IS 'Fecha máxima (Fecha de la orden original + 15 días calendario) en la que el vehículo puede aplicar a una reinspección.';