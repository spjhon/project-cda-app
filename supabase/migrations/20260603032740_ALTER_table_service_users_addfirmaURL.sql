-- Migración: Adición de campo para firma en formato Base64
ALTER TABLE public.service_users 
ADD COLUMN signature_base64 TEXT;

-- Comentario de auditoría técnica explicativo
COMMENT ON COLUMN public.service_users.signature_base64 IS 'Snapshot de la firma del recepcionista codificada en Base64 (JPEG, calidad 0.4) para incrustación directa en PDFs.';