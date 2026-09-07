-- ============================================================
-- RPC: CREAR TARIFA DE SERVICIO
-- ============================================================
-- Inserta únicamente el registro principal de una tarifa
-- en vehicle_service_rate.
--
-- Por ahora NO inserta:
--   - fuels
--   - classes
--   - fees
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_vehicle_service_rate(
    p_tenant_id UUID,
    p_vehicle_type public.vehicle_type_enum,
    p_base_price_rtm NUMERIC(12,2),
    p_service_type public.service_type_enum
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
        service_type
    )
    VALUES (
        p_tenant_id,
        p_vehicle_type,
        p_base_price_rtm,
        p_service_type
    )

    RETURNING id
    INTO v_rate_id;


    -- ========================================================
    -- DEVOLVER ID DE LA TARIFA CREADA
    -- ========================================================

    RETURN v_rate_id;

END;
$$;