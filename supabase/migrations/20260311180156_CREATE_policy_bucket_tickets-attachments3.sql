-- 2. Eliminamos políticas viejas por si acaso (para evitar conflictos tras un reset)
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own files" ON storage.objects;
DROP POLICY IF EXISTS "Aislar_tenants_en_storage" ON storage.objects;

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