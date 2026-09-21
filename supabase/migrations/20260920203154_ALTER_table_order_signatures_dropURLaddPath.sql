ALTER TABLE public.order_signatures
ADD COLUMN signature_path TEXT NULL;

ALTER TABLE public.order_signatures
ALTER COLUMN signature_url DROP NOT NULL;



-- ==========================================
-- COMENTARIOS DE LA TABLA
-- ==========================================

COMMENT ON TABLE public.order_signatures IS
'Firmas capturadas y asociadas a una orden de entrada, incluyendo la referencia al rol de firma definido en la plantilla.';


-- ==========================================
-- COMENTARIOS DE LAS COLUMNAS
-- ==========================================

COMMENT ON COLUMN public.order_signatures.id IS
'Identificador único del registro de firma de la orden.';

COMMENT ON COLUMN public.order_signatures.tenant_id IS
'Identificador del tenant o CDA al que pertenece la firma.';

COMMENT ON COLUMN public.order_signatures.entry_order_id IS
'Identificador de la orden de entrada a la que pertenece la firma.';

COMMENT ON COLUMN public.order_signatures.template_signature_id IS
'Identificador de la configuración de firma de la plantilla que define el rol o tipo de firma requerida.';

COMMENT ON COLUMN public.order_signatures.signature_path IS
'Ruta en Supabase Storage de la firma capturada para esta orden de entrada.';

COMMENT ON COLUMN public.order_signatures.signature_url IS
'Firma en formato Base64. Campo temporal para migración de firmas existentes.';

COMMENT ON COLUMN public.order_signatures.created_at IS
'Fecha y hora en que se registró la firma de la orden.';


-- ==========================================
-- COMENTARIOS DE LAS RESTRICCIONES
-- ==========================================

COMMENT ON CONSTRAINT os_tenant_fkey
ON public.order_signatures IS
'Relaciona la firma con el tenant al que pertenece.';

COMMENT ON CONSTRAINT os_order_fkey
ON public.order_signatures IS
'Relaciona la firma con la orden de entrada y elimina la firma cuando la orden es eliminada.';

COMMENT ON CONSTRAINT os_template_sig_fkey
ON public.order_signatures IS
'Relaciona la firma capturada con la configuración de firma definida en la plantilla de la orden.';


-- ==========================================
-- COMENTARIOS DE LOS ÍNDICES
-- ==========================================

COMMENT ON INDEX public.os_entry_order_id_idx IS
'Índice para recuperar rápidamente las firmas asociadas a una orden de entrada.';

COMMENT ON INDEX public.os_tenant_id_idx IS
'Índice para optimizar consultas y filtros de firmas por tenant.';

COMMENT ON INDEX public.os_template_sig_id_idx IS
'Índice para optimizar consultas de firmas por la configuración de firma de la plantilla.';