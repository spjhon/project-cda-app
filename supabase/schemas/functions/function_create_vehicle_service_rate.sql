
-- ============================================================
-- RPC: CREAR TARIFA DE SERVICIO
-- ============================================================


CREATE OR REPLACE FUNCTION public.create_vehicle_service_rate(
    p_tenant_id UUID,
    p_name TEXT,
    p_vehicle_type public.vehicle_type_enum,
    p_base_price_rtm NUMERIC(12,2),
    p_iva_percentage NUMERIC(5,2),
    p_service_type public.service_type_enum,
    p_fuels JSONB DEFAULT '[]'::JSONB,
    p_classes JSONB DEFAULT '[]'::JSONB,
    p_service_types JSONB DEFAULT '[]'::JSONB,
    p_fees JSONB DEFAULT '[]'::JSONB,
    p_company_ids JSONB DEFAULT '[]'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_rate_id UUID;
    v_company_count INTEGER;

    v_fuels JSONB :=
        COALESCE(NULLIF(p_fuels, 'null'::JSONB), '[]'::JSONB);

    v_classes JSONB :=
        COALESCE(NULLIF(p_classes, 'null'::JSONB), '[]'::JSONB);

    v_service_types JSONB :=
        COALESCE(NULLIF(p_service_types, 'null'::JSONB), '[]'::JSONB);

    v_fees JSONB :=
        COALESCE(NULLIF(p_fees, 'null'::JSONB), '[]'::JSONB);

    v_company_ids JSONB :=
        COALESCE(NULLIF(p_company_ids, 'null'::JSONB), '[]'::JSONB);

BEGIN

    -- ========================================================
    -- PASO 1: VALIDAR DATOS OBLIGATORIOS
    -- ========================================================

    IF p_tenant_id IS NULL THEN
        RAISE EXCEPTION
            'El tenant seleccionado es obligatorio.';
    END IF;

    IF p_name IS NULL OR BTRIM(p_name) = '' THEN
        RAISE EXCEPTION
            'El nombre de la tarifa es obligatorio.';
    END IF;

    -- ========================================================
    -- PASO 2: VALIDAR ACCESO AL TENANT
    -- ========================================================

    IF NOT EXISTS (
        SELECT 1
        FROM public.service_users su
        INNER JOIN public.tenant_permissions tp
            ON tp.service_user_id = su.id
        WHERE su.auth_user_id = (SELECT auth.uid())
          AND su.is_active = TRUE
          AND tp.tenant_id = p_tenant_id
    ) THEN
        RAISE EXCEPTION
            'Acceso denegado: el usuario no tiene permisos para este tenant.';
    END IF;

    -- ========================================================
    -- PASO 3: VALIDAR COMPANIES
    -- ========================================================

    -- Si no hay empresas, no se requiere validación.
    IF jsonb_array_length(v_company_ids) > 0 THEN

        -- Verificar que todos los IDs sean UUID válidos.
        -- Una conversión inválida cancela la operación.
        PERFORM company_id::UUID
        FROM jsonb_array_elements_text(v_company_ids) AS company_id;

        -- Contar empresas existentes, del tenant y no eliminadas.
        SELECT COUNT(DISTINCT company_id::UUID)
        INTO v_company_count
        FROM jsonb_array_elements_text(v_company_ids) AS company_id
        INNER JOIN public.tenants_company AS company
            ON company.id = company_id::UUID
        WHERE company.tenant_id = p_tenant_id
          AND company.deleted_at IS NULL;

        -- Rechazar si alguna empresa no es válida.
        IF v_company_count <> (
            SELECT COUNT(DISTINCT company_id::UUID)
            FROM jsonb_array_elements_text(v_company_ids) AS company_id
        ) THEN
            RAISE EXCEPTION
                'Una o más empresas no existen, pertenecen a otro tenant o están eliminadas.';
        END IF;

    END IF;

    -- ========================================================
    -- PASO 4: INSERTAR TARIFA PRINCIPAL
    -- ========================================================

    INSERT INTO public.vehicle_service_rate (
        tenant_id,
        name,
        vehicle_type,
        base_price,
        iva_percentage,
        service_type
    )
    VALUES (
        p_tenant_id,
        BTRIM(p_name),
        p_vehicle_type,
        p_base_price_rtm,
        p_iva_percentage,
        p_service_type
    )
    RETURNING id INTO v_rate_id;

    -- ========================================================
    -- PASO 5: INSERTAR FUELS
    -- ========================================================

    INSERT INTO public.vehicle_service_rate_fuels (
        tenant_id,
        vehicle_service_rate_id,
        fuel_type
    )
    SELECT
        p_tenant_id,
        v_rate_id,
        fuel::public.fuel_type_enum
    FROM jsonb_array_elements_text(v_fuels) AS fuel;

    -- ========================================================
    -- PASO 6: INSERTAR CLASSES
    -- ========================================================

    INSERT INTO public.vehicle_service_rate_classes (
        tenant_id,
        vehicle_service_rate_id,
        vehicle_class
    )
    SELECT
        p_tenant_id,
        v_rate_id,
        class::public.vehicle_class_enum
    FROM jsonb_array_elements_text(v_classes) AS class;

    -- ========================================================
    -- PASO 7: INSERTAR SERVICE TYPES
    -- ========================================================

    INSERT INTO public.vehicle_service_rate_service_types (
        tenant_id,
        vehicle_service_rate_id,
        service_type
    )
    SELECT
        p_tenant_id,
        v_rate_id,
        service_type::public.vehicle_service_type_enum
    FROM jsonb_array_elements_text(v_service_types) AS service_type;

    -- ========================================================
    -- PASO 8: INSERTAR FEES
    -- ========================================================

    INSERT INTO public.fee_types (
        tenant_id,
        vehicle_service_rate_id,
        name,
        description,
        fee_amount,
        iva_percentage,
        vehicle_age_from,
        vehicle_age_to
    )
    SELECT
        p_tenant_id,
        v_rate_id,
        fee->>'name',
        NULLIF(fee->>'description', ''),
        (fee->>'fee_amount')::NUMERIC(12,2),
        NULLIF(fee->>'iva_percentage', '')::NUMERIC(5,2),
        NULLIF(fee->>'vehicle_age_from', '')::INTEGER,
        NULLIF(fee->>'vehicle_age_to', '')::INTEGER
    FROM jsonb_array_elements(v_fees) AS fee;

    -- ========================================================
    -- PASO 9: INSERTAR COMPANIES
    -- ========================================================

    INSERT INTO public.vehicle_service_rate_companies (
        tenant_id,
        vehicle_service_rate_id,
        company_id
    )
    SELECT DISTINCT
        p_tenant_id,
        v_rate_id,
        company_id::UUID
    FROM jsonb_array_elements_text(v_company_ids) AS company_id;

    -- ========================================================
    -- PASO 10: DEVOLVER ID
    -- ========================================================

    RETURN v_rate_id;

END;
$$;
