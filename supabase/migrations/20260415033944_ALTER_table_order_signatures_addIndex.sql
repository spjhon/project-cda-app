-- Optimiza la búsqueda por tipo de firma (Inspector, Cliente, etc.)
CREATE INDEX IF NOT EXISTS os_template_sig_id_idx 
    ON public.order_signatures (template_signature_id);