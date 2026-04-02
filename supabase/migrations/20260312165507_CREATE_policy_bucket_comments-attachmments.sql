-- 3. Creamos la ÚNICA política maestra
CREATE POLICY "Aislar_comments_en_storage"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'comments-attachments'
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT tp.tenant_id 
    FROM public.tenant_permissions tp
    JOIN public.service_users su ON tp.service_user_id = su.id
    WHERE su.auth_user_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'comments-attachments'
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT tp.tenant_id 
    FROM public.tenant_permissions tp
    JOIN public.service_users su ON tp.service_user_id = su.id
    WHERE su.auth_user_id = auth.uid()
  )
);