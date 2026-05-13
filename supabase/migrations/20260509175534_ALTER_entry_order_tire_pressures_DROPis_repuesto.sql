-- 1. Eliminamos la columna redundante
ALTER TABLE public.entry_order_tire_pressures 
DROP COLUMN IF EXISTS es_repuesto;

-- 2. (Opcional pero recomendado) Añadimos una restricción para asegurar 
-- que la posición solo acepte valores válidos, incluyendo 'repuesto'
ALTER TABLE public.entry_order_tire_pressures
ADD CONSTRAINT check_tire_position 
CHECK (posicion IN ('izquierda', 'derecha', 'repuesto', 'interno_izquierdo', 'interno_derecho'));

-- 3. Comentario para documentar el cambio en la tabla
COMMENT ON COLUMN public.entry_order_tire_pressures.posicion IS 'Posición de la llanta: izquierda, derecha o repuesto';