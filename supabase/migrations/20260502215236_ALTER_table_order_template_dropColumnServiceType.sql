ALTER TABLE public.order_template 
DROP COLUMN IF EXISTS service_type;

-- 1. Agregar la columna service_type a la tabla entry_orders
-- La definimos como NOT NULL porque toda orden debe tener un tipo de servicio
ALTER TABLE public.entry_orders 
ADD COLUMN service_type public.service_type_enum NOT NULL DEFAULT 'RTM';

-- 2. Crear un índice para optimizar búsquedas por tipo de servicio
-- Útil para reportes (ej: "¿Cuántas RTM se hicieron este mes?")
CREATE INDEX IF NOT EXISTS entry_orders_service_type_idx 
ON public.entry_orders USING btree (service_type);

-- 3. (Opcional) Comentario de tabla para documentación
COMMENT ON COLUMN public.entry_orders.service_type IS 'Tipo de servicio legal o comercial asociado a esta orden de entrada';