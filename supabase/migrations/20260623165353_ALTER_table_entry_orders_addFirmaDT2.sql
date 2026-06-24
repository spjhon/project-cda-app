-- ==========================================
-- MIGRACIÓN: CAMPOS DE SNAPSHOT DEL DIRECTOR TÉCNICO
-- ==========================================

ALTER TABLE public.entry_orders 
ADD COLUMN IF NOT EXISTS director_tecnico_tipo_documento_snapshot TEXT NULL,
ADD COLUMN IF NOT EXISTS director_tecnico_numero_documento_snapshot VARCHAR NULL,
ADD COLUMN IF NOT EXISTS director_tecnico_nombre_snapshot TEXT NULL,
ADD COLUMN IF NOT EXISTS director_tecnico_firma_base64_snapshot TEXT NULL;

-- ==========================================
-- DOCUMENTACIÓN DE AUDITORÍA (ISO 17020)
-- ==========================================

COMMENT ON COLUMN public.entry_orders.director_tecnico_tipo_documento_snapshot 
IS 'Snapshot del tipo de documento del Director Técnico que aprueba la orden.';

COMMENT ON COLUMN public.entry_orders.director_tecnico_numero_documento_snapshot 
IS 'Snapshot del número de documento del Director Técnico que aprueba la orden.';

COMMENT ON COLUMN public.entry_orders.director_tecnico_nombre_snapshot 
IS 'Snapshot del nombre completo del Director Técnico que firma el cierre.';

COMMENT ON COLUMN public.entry_orders.director_tecnico_firma_base64_snapshot 
IS 'Snapshot en formato Base64 de la firma digitalizada del Director Técnico (Auditoría ISO 17020).';