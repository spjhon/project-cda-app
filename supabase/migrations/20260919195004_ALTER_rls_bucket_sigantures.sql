-- ============================================================
-- ELIMINAR RLS ANTERIORES
-- ============================================================

DROP POLICY IF EXISTS "Users can view their tenant signatures"
ON storage.objects;

DROP POLICY IF EXISTS "Users can upload their tenant signatures"
ON storage.objects;

DROP POLICY IF EXISTS "Users can update their tenant signatures"
ON storage.objects;

DROP POLICY IF EXISTS "Users can delete their tenant signatures"
ON storage.objects;

-- ============================================================
-- RLS STORAGE - SIGNATURES
-- ============================================================


-- ============================================================
-- SELECT
-- ============================================================

CREATE POLICY "Users can view signatures"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'signatures'
    AND (
        -- ----------------------------------------------------
        -- Firma actual del propio service_user
        -- service_users/{service_user_id}/signature.jpg
        -- ----------------------------------------------------
        (
            (storage.foldername(name))[1] = 'service_users'
            AND EXISTS (
                SELECT 1
                FROM public.service_users su
                WHERE su.id::text = (storage.foldername(name))[2]
                  AND su.auth_user_id = auth.uid()
            )
        )

        OR

        -- ----------------------------------------------------
        -- Firmas históricas de entry_orders
        -- entry_orders/{entry_order_id}/...
        -- ----------------------------------------------------
        (
            (storage.foldername(name))[1] = 'entry_orders'
            AND EXISTS (
                SELECT 1
                FROM public.entry_orders eo
                INNER JOIN public.tenant_permissions tp
                    ON tp.tenant_id = eo.tenant_id
                INNER JOIN public.service_users su
                    ON su.id = tp.service_user_id
                WHERE eo.id::text = (storage.foldername(name))[2]
                  AND su.auth_user_id = auth.uid()
            )
        )
    )
);


-- ============================================================
-- INSERT
-- ============================================================

CREATE POLICY "Users can upload signatures"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'signatures'
    AND (
        -- ----------------------------------------------------
        -- Firma actual del propio service_user
        -- ----------------------------------------------------
        (
            (storage.foldername(name))[1] = 'service_users'
            AND EXISTS (
                SELECT 1
                FROM public.service_users su
                WHERE su.id::text = (storage.foldername(name))[2]
                  AND su.auth_user_id = auth.uid()
            )
        )

        OR

        -- ----------------------------------------------------
        -- Firmas históricas de entry_orders
        -- ----------------------------------------------------
        (
            (storage.foldername(name))[1] = 'entry_orders'
            AND EXISTS (
                SELECT 1
                FROM public.entry_orders eo
                INNER JOIN public.tenant_permissions tp
                    ON tp.tenant_id = eo.tenant_id
                INNER JOIN public.service_users su
                    ON su.id = tp.service_user_id
                WHERE eo.id::text = (storage.foldername(name))[2]
                  AND su.auth_user_id = auth.uid()
            )
        )
    )
);


-- ============================================================
-- UPDATE
-- ============================================================

CREATE POLICY "Users can update signatures"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'signatures'
    AND (
        -- ----------------------------------------------------
        -- Firma actual del propio service_user
        -- ----------------------------------------------------
        (
            (storage.foldername(name))[1] = 'service_users'
            AND EXISTS (
                SELECT 1
                FROM public.service_users su
                WHERE su.id::text = (storage.foldername(name))[2]
                  AND su.auth_user_id = auth.uid()
            )
        )

        OR

        -- ----------------------------------------------------
        -- Firmas históricas de entry_orders
        -- ----------------------------------------------------
        (
            (storage.foldername(name))[1] = 'entry_orders'
            AND EXISTS (
                SELECT 1
                FROM public.entry_orders eo
                INNER JOIN public.tenant_permissions tp
                    ON tp.tenant_id = eo.tenant_id
                INNER JOIN public.service_users su
                    ON su.id = tp.service_user_id
                WHERE eo.id::text = (storage.foldername(name))[2]
                  AND su.auth_user_id = auth.uid()
            )
        )
    )
)
WITH CHECK (
    bucket_id = 'signatures'
    AND (
        -- ----------------------------------------------------
        -- Firma actual del propio service_user
        -- ----------------------------------------------------
        (
            (storage.foldername(name))[1] = 'service_users'
            AND EXISTS (
                SELECT 1
                FROM public.service_users su
                WHERE su.id::text = (storage.foldername(name))[2]
                  AND su.auth_user_id = auth.uid()
            )
        )

        OR

        -- ----------------------------------------------------
        -- Firmas históricas de entry_orders
        -- ----------------------------------------------------
        (
            (storage.foldername(name))[1] = 'entry_orders'
            AND EXISTS (
                SELECT 1
                FROM public.entry_orders eo
                INNER JOIN public.tenant_permissions tp
                    ON tp.tenant_id = eo.tenant_id
                INNER JOIN public.service_users su
                    ON su.id = tp.service_user_id
                WHERE eo.id::text = (storage.foldername(name))[2]
                  AND su.auth_user_id = auth.uid()
            )
        )
    )
);


-- ============================================================
-- DELETE
-- ============================================================

CREATE POLICY "Users can delete signatures"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'signatures'
    AND (
        -- ----------------------------------------------------
        -- Firma actual del propio service_user
        -- ----------------------------------------------------
        (
            (storage.foldername(name))[1] = 'service_users'
            AND EXISTS (
                SELECT 1
                FROM public.service_users su
                WHERE su.id::text = (storage.foldername(name))[2]
                  AND su.auth_user_id = auth.uid()
            )
        )

        OR

        -- ----------------------------------------------------
        -- Firmas históricas de entry_orders
        -- ----------------------------------------------------
        (
            (storage.foldername(name))[1] = 'entry_orders'
            AND EXISTS (
                SELECT 1
                FROM public.entry_orders eo
                INNER JOIN public.tenant_permissions tp
                    ON tp.tenant_id = eo.tenant_id
                INNER JOIN public.service_users su
                    ON su.id = tp.service_user_id
                WHERE eo.id::text = (storage.foldername(name))[2]
                  AND su.auth_user_id = auth.uid()
            )
        )
    )
);