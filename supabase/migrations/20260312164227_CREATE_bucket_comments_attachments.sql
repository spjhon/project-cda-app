-- 1. Asegurarnos de que el bucket existe (usamos ON CONFLICT para que no falle si ya existe)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'comments-attachments', 
  'comments-attachments', 
  false, 
  5242880, -- Límite de 5MB en bytes
  ARRAY['image/jpeg', 'image/png', 'application/pdf'] -- Tipos permitidos
)
ON CONFLICT (id) DO UPDATE 
SET 
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;