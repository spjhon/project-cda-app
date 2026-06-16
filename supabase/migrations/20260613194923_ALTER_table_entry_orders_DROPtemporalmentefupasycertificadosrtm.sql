ALTER TABLE public.entry_orders
  DROP COLUMN IF EXISTS oficina_fupas,
  DROP COLUMN IF EXISTS oficina_certificados_runt;

-- 2. Eliminar los índices asociados para no dejar basura en la base de datos
DROP INDEX IF EXISTS public.entry_orders_oficina_fupas_idx;
DROP INDEX IF EXISTS public.entry_orders_oficina_certificados_runt_idx;