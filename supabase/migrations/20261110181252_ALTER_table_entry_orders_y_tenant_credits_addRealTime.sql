-- Habilitar Realtime para las tablas de órdenes y créditos
ALTER PUBLICATION supabase_realtime ADD TABLE public.entry_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tenant_credits;