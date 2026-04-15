-- Optimiza la integridad referencial y búsquedas por autor
CREATE INDEX IF NOT EXISTS order_template_created_by_idx 
    ON public.order_template (created_by)