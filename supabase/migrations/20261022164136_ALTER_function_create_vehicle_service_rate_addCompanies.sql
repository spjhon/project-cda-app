-- ============================================================
-- ELIMINAR RPC ANTERIOR: CREAR TARIFA DE SERVICIO
-- ============================================================

DROP FUNCTION IF EXISTS public.create_vehicle_service_rate(
    UUID,
    public.vehicle_type_enum,
    NUMERIC,
    NUMERIC,
    public.service_type_enum,
    JSONB,
    JSONB,
    JSONB,
    JSONB
);

-- ============================================================
-- RPC: CREAR TARIFA DE SERVICIO
-- ============================================================
--
-- Inserta:
--   - vehicle_service_rate
--   - vehicle_service_rate_fuels asociados a la tarifa
--   - vehicle_service_rate_classes asociados a la tarifa
--   - vehicle_service_rate_service_types asociados a la tarifa
--   - fee_types asociados a la tarifa
--   - vehicle_service_rate_companies asociados a la tarifa
--
-- IVA:
--   - vehicle_service_rate.iva_percentage
--       → IVA del precio base
--
--   - fee_types.iva_percentage
--       → IVA individual de cada fee
--
-- Los fuels, classes, service_types y fees llegan como
-- arreglos JSONB.
--
-- Las companies llegan como un arreglo JSONB de UUID.
-- Si no se envían empresas, se utiliza un arreglo vacío.
-- ============================================================


-- ============================================================
-- CREAR NUEVA FUNCIÓN
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_vehicle_service_rate(
    p_tenant_id UUID,
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

   -- ========================================================
    -- VALIDAR COMPANIES ASOCIADAS A LA TARIFA
    -- ========================================================
    --
    -- Validaciones:
    --   - Los IDs deben corresponder a empresas existentes.
    --   - Las empresas deben pertenecer al tenant indicado.
    --   - Las empresas no deben estar eliminadas lógicamente.
    --
    -- Si alguna empresa no cumple las condiciones, se cancela
    -- la operación completa.
    -- ========================================================

    IF COALESCE(p_company_ids, '[]'::JSONB) <> '[]'::JSONB THEN

        -- Verificar que todos los IDs sean UUID válidos.
        -- Una conversión inválida genera un error y cancela
        -- la operación completa.

        PERFORM company_id::UUID
        FROM jsonb_array_elements_text(p_company_ids) AS company_id;

        -- Contar cuántas empresas cumplen las condiciones.

        SELECT COUNT(DISTINCT company_id::UUID)
        INTO v_company_count
        FROM jsonb_array_elements_text(p_company_ids) AS company_id
        INNER JOIN public.tenants_company AS company
            ON company.id = company_id::UUID
        WHERE company.tenant_id = p_tenant_id
          AND company.deleted_at IS NULL;

        -- Si el número de empresas válidas no coincide con
        -- el número de IDs únicos enviados, rechazar la llamada.

        IF v_company_count <> (
            SELECT COUNT(DISTINCT company_id::UUID)
            FROM jsonb_array_elements_text(p_company_ids) AS company_id
        ) THEN
            RAISE EXCEPTION
                'Una o más empresas no existen, pertenecen a otro tenant o están eliminadas.';
        END IF;

    END IF;

    -- ========================================================
    -- INSERTAR TARIFA PRINCIPAL
    -- ========================================================

    INSERT INTO public.vehicle_service_rate (
        tenant_id,
        vehicle_type,
        base_price,
        iva_percentage,
        service_type
    )
    VALUES (
        p_tenant_id,
        p_vehicle_type,
        p_base_price_rtm,
        p_iva_percentage,
        p_service_type
    )
    RETURNING id
    INTO v_rate_id;


    -- ========================================================
    -- INSERTAR FUELS ASOCIADOS A LA TARIFA
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
    FROM jsonb_array_elements_text(p_fuels) AS fuel;


    -- ========================================================
    -- INSERTAR CLASSES ASOCIADAS A LA TARIFA
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
    FROM jsonb_array_elements_text(p_classes) AS class;


    -- ========================================================
    -- INSERTAR SERVICE TYPES ASOCIADOS A LA TARIFA
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
    FROM jsonb_array_elements_text(p_service_types) AS service_type;


    -- ========================================================
    -- INSERTAR FEES ASOCIADOS A LA TARIFA
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

        -- ====================================================
        -- IVA DEL FEE
        -- ====================================================

        NULLIF(fee->>'iva_percentage', '')::NUMERIC(5,2),

        -- ====================================================
        -- EDAD DEL VEHÍCULO
        -- ====================================================

        NULLIF(fee->>'vehicle_age_from', '')::INTEGER,
        NULLIF(fee->>'vehicle_age_to', '')::INTEGER

    FROM jsonb_array_elements(p_fees) AS fee;


    -- ========================================================
    -- INSERTAR COMPANIES ASOCIADAS A LA TARIFA
    -- ========================================================
    --
    -- p_company_ids debe ser un arreglo JSONB de UUID:
    -- ["uuid-empresa-1", "uuid-empresa-2"]
    --
    -- Si llega NULL, se trata como un arreglo vacío.
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
    FROM jsonb_array_elements_text(
        COALESCE(p_company_ids, '[]'::JSONB)
    ) AS company_id;


    -- ========================================================
    -- DEVOLVER ID DE LA TARIFA CREADA
    -- ========================================================

    RETURN v_rate_id;

END;
$$;