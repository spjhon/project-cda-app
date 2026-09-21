ALTER TABLE public.entry_orders
ADD COLUMN funcionario_firma_path_snapshot text NULL,
ADD COLUMN director_tecnico_firma_path_snapshot text NULL;

COMMENT ON COLUMN public.entry_orders.funcionario_firma_path_snapshot IS
'Ruta en Supabase Storage de la firma del funcionario utilizada como snapshot al crear la orden de entrada.';

COMMENT ON COLUMN public.entry_orders.director_tecnico_firma_path_snapshot IS
'Ruta en Supabase Storage de la firma del director técnico utilizada como snapshot en la orden de entrada.';