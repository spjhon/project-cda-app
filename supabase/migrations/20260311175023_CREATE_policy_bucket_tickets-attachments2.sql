CREATE POLICY "Aislar_tenants_en_storage"
ON storage.objects
FOR ALL -- Aplica para SELECT, INSERT, UPDATE y DELETE
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