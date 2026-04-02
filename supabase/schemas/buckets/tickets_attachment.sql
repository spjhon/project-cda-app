-- 1. Asegurarnos de que el bucket existe (usamos ON CONFLICT para que no falle si ya existe)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tickets-attachments', 
  'tickets-attachments', 
  false, 
  5242880, -- Límite de 5MB en bytes
  ARRAY['image/jpeg', 'image/png', 'application/pdf'] -- Tipos permitidos
)
ON CONFLICT (id) DO UPDATE 
SET 
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. Creamos la ÚNICA política maestra
CREATE POLICY "Aislar_tenants_en_storage"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'tickets-attachments'
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT tp.tenant_id 
    FROM public.tenant_permissions tp
    JOIN public.service_users su ON tp.service_user_id = su.id
    WHERE su.auth_user_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'tickets-attachments'
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT tp.tenant_id 
    FROM public.tenant_permissions tp
    JOIN public.service_users su ON tp.service_user_id = su.id
    WHERE su.auth_user_id = auth.uid()
  )
);