-- ==========================================
-- ÍNDICES PARA order_signatures
-- ==========================================

-- Para recuperar rápido las firmas de una orden (útil al generar el PDF)
CREATE INDEX IF NOT EXISTS os_entry_order_id_idx 
    ON public.order_signatures (entry_order_id);

-- Para optimizar el filtrado de seguridad por CDA
CREATE INDEX IF NOT EXISTS os_tenant_id_idx 
    ON public.order_signatures (tenant_id);