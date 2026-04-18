-- 1. Eliminar la columna de la tabla entry_orders
ALTER TABLE public.entry_orders 
DROP COLUMN IF EXISTS tipo_de_servicio;
