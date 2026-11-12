-- Eliminar la restricción NOT NULL de la columna consecutivo
ALTER TABLE public.entry_orders 
ALTER COLUMN consecutivo DROP NOT NULL;