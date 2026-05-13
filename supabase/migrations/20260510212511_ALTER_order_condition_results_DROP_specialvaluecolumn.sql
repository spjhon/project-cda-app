-- 1. Eliminamos la columna special_value
ALTER TABLE public.order_condition_results 
DROP COLUMN IF EXISTS special_value;