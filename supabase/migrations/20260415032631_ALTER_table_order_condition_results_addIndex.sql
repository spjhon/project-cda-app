-- ==========================================
-- ÍNDICES PARA order_condition_results
-- ==========================================

-- Para cargar instantáneamente todos los resultados de una orden específica
CREATE INDEX IF NOT EXISTS ocr_order_id_idx 
    ON public.order_condition_results (entry_order_id);

-- Para que el RLS y el aislamiento por CDA sea ultra veloz
CREATE INDEX IF NOT EXISTS ocr_tenant_id_idx 
    ON public.order_condition_results (tenant_id);