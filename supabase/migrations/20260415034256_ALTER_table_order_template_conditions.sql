-- 1. Para que el RLS y el aislamiento por CDA sea veloz (El que te pide Supabase)
CREATE INDEX IF NOT EXISTS otc_tenant_id_idx 
    ON public.order_template_conditions (tenant_id);

-- 2. Para cargar instantáneamente los ítems de una plantilla específica
-- (Muy recomendado para que el formulario de inspección no tenga lag)
CREATE INDEX IF NOT EXISTS otc_template_id_idx 
    ON public.order_template_conditions (order_template_id);