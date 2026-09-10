-- ============================================================
-- ELIMINAR RPC ANTERIOR
-- ============================================================

DROP FUNCTION IF EXISTS public.create_vehicle_service_rate(
    UUID,
    public.vehicle_type_enum,
    NUMERIC,
    public.service_type_enum,
    JSONB
);


-- ============================================================
-- RPC: CREAR TARIFA DE SERVICIO
-- ============================================================
--
-- Inserta:
--   - vehicle_service_rate
--   - fee_types asociados a la tarifa
--
-- IVA:
--   - vehicle_service_rate.iva_percentage
--       → IVA del precio base
--
--   - fee_types.iva_percentage
--       → IVA individual de cada fee
--
-- Por ahora NO inserta:
--   - fuels
--   - classes
--   - service_types
--
-- Los fees llegan como un arreglo JSONB.
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_vehicle_service_rate(
    p_tenant_id UUID,
    p_vehicle_type public.vehicle_type_enum,
    p_base_price_rtm NUMERIC(12,2),
    p_iva_percentage NUMERIC(5,2),
    p_service_type public.service_type_enum,
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

        NULLIF(
            fee->>'description',
            ''
        ),

        (fee->>'fee_amount')::NUMERIC(12,2),

        -- ==================================================
        -- IVA DEL FEE
        -- Puede ser NULL
        -- ==================================================

        (fee->>'iva_percentage')::NUMERIC(5,2),

        -- ==================================================
        -- EDAD DEL VEHÍCULO
        -- ==================================================

        NULLIF(
            fee->>'vehicle_age_from',
            ''
        )::INTEGER,

        NULLIF(
            fee->>'vehicle_age_to',
            ''
        )::INTEGER

    FROM jsonb_array_elements(p_fees) AS fee;


    -- ========================================================
    -- DEVOLVER ID DE LA TARIFA CREADA
    -- ========================================================

    RETURN v_rate_id;

END;
$$;
