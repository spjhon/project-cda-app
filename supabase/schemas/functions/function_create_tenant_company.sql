
-- Eliminar la versión anterior, que no recibía p_tenant_id.
DROP FUNCTION IF EXISTS public.create_tenant_company(
    text, text, text, text, text
);

CREATE OR REPLACE FUNCTION public.create_tenant_company(
    p_tenant_id uuid,
    p_nit text,
    p_name text,
    p_address text DEFAULT NULL,
    p_phone text DEFAULT NULL,
    p_email text DEFAULT NULL
)
RETURNS public.tenants_company
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = 'public'
AS $$
DECLARE
    v_company public.tenants_company;
BEGIN
    -- =========================================================
    -- PASO 1: VALIDAR EL TENANT SOLICITADO
    -- =========================================================

    IF p_tenant_id IS NULL THEN
        RAISE EXCEPTION
            'El tenant seleccionado es obligatorio.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.service_users su
        INNER JOIN public.tenant_permissions tp
            ON tp.service_user_id = su.id
        WHERE su.auth_user_id = (SELECT auth.uid())
          AND su.is_active = true
          AND tp.tenant_id = p_tenant_id
    ) THEN
        RAISE EXCEPTION
            'Acceso denegado: el usuario no tiene permisos para este tenant.';
    END IF;

    -- =========================================================
    -- PASO 2: VALIDAR LOS CAMPOS
    -- =========================================================

    IF NULLIF(btrim(p_nit), '') IS NULL
       OR length(btrim(p_nit)) < 8 THEN
        RAISE EXCEPTION
            'El NIT debe tener al menos 8 caracteres.';
    END IF;

    IF NULLIF(btrim(p_name), '') IS NULL
       OR length(btrim(p_name)) < 2 THEN
        RAISE EXCEPTION
            'La razón social debe tener al menos 2 caracteres.';
    END IF;

    IF NULLIF(btrim(p_phone), '') IS NOT NULL
       AND (
           length(btrim(p_phone)) < 10
           OR btrim(p_phone) !~ '[0-9]'
       ) THEN
        RAISE EXCEPTION
            'El teléfono debe tener al menos 10 caracteres e incluir números.';
    END IF;

    IF NULLIF(btrim(p_email), '') IS NOT NULL
       AND btrim(p_email) !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
        RAISE EXCEPTION
            'El correo electrónico no tiene un formato válido.';
    END IF;

    -- =========================================================
    -- PASO 3: CREAR O ACTUALIZAR LA EMPRESA POR NIT Y TENANT
    -- =========================================================

    INSERT INTO public.tenants_company (
        tenant_id,
        nit,
        name,
        address,
        phone,
        email
    )
    VALUES (
        p_tenant_id,
        btrim(p_nit),
        btrim(p_name),
        NULLIF(btrim(p_address), ''),
        NULLIF(btrim(p_phone), ''),
        NULLIF(btrim(p_email), '')
    )
    ON CONFLICT (tenant_id, nit)
    DO UPDATE SET
        name = EXCLUDED.name,
        address = EXCLUDED.address,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        deleted_at = NULL,
        updated_at = now()
    RETURNING *
    INTO v_company;

    -- =========================================================
    -- PASO 4: RETORNAR LA EMPRESA
    -- =========================================================

    RETURN v_company;
END;
$$;

-- =============================================================
-- PERMISOS DE EJECUCIÓN
-- =============================================================

REVOKE ALL ON FUNCTION public.create_tenant_company(
    uuid, text, text, text, text, text
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_tenant_company(
    uuid, text, text, text, text, text
) TO authenticated;
