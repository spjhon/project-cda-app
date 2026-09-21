-- ============================================================
-- BUCKET PARA FIRMAS
-- ============================================================

INSERT INTO storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
)
VALUES (
    'signatures',
    'signatures',
    false,
    524288, -- 512 KB
    ARRAY[
        'image/jpeg',
        'image/png',
        'image/webp'
    ]
)
ON CONFLICT (id) DO UPDATE
SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;


-- ============================================================
-- RLS STORAGE
-- ============================================================

-- ============================================================
-- SELECT
-- ============================================================

CREATE POLICY "Users can view their tenant signatures"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'signatures'
    AND (storage.foldername(name))[1]::uuid IN (
        SELECT public.get_my_tenants()
    )
);


-- ============================================================
-- INSERT
-- ============================================================

CREATE POLICY "Users can upload their tenant signatures"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'signatures'
    AND (storage.foldername(name))[1]::uuid IN (
        SELECT public.get_my_tenants()
    )
);


-- ============================================================
-- UPDATE
-- ============================================================

CREATE POLICY "Users can update their tenant signatures"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'signatures'
    AND (storage.foldername(name))[1]::uuid IN (
        SELECT public.get_my_tenants()
    )
)
WITH CHECK (
    bucket_id = 'signatures'
    AND (storage.foldername(name))[1]::uuid IN (
        SELECT public.get_my_tenants()
    )
);


-- ============================================================
-- DELETE
-- ============================================================

CREATE POLICY "Users can delete their tenant signatures"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'signatures'
    AND (storage.foldername(name))[1]::uuid IN (
        SELECT public.get_my_tenants()
    )
);