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
-- ============================================================


-- ============================================================
-- ELIMINAR FUNCIÓN ANTERIOR
-- ============================================================

DROP FUNCTION IF EXISTS public.create_vehicle_service_rate(
    UUID,
    public.vehicle_type_enum,
    NUMERIC,
    NUMERIC,
    public.service_type_enum,
    JSONB,
    JSONB
);


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
    p_fees JSONB DEFAULT '[]'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_rate_id UUID;
BEGIN

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
    -- DEVOLVER ID DE LA TARIFA CREADA
    -- ========================================================

    RETURN v_rate_id;

END;
$$;