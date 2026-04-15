-- Para filtrar por el inspector/funcionario que realizó la orden
CREATE INDEX IF NOT EXISTS entry_orders_funcionario_id_idx 
    ON public.entry_orders (funcionario_id);

-- Para reportes por tipo de plantilla (ej: cuántas de Livianos vs Motos)
CREATE INDEX IF NOT EXISTS entry_orders_plantilla_id_idx 
    ON public.entry_orders (plantilla_id);