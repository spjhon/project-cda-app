-- ============================================================
-- RPC: OBTENER TARIFAS ACTIVAS DE SERVICIOS
-- ============================================================

CREATE OR REPLACE FUNCTION public.fetch_active_vehicle_service_rates(
    p_tenant_id UUID
)
RETURNS TABLE (
    id UUID,
    tenant_id UUID,
    vehicle_type public.vehicle_type_enum,
    base_price NUMERIC(12,2),
    service_type public.service_type_enum,
    created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
    SELECT
        vsr.id,
        vsr.tenant_id,
        vsr.vehicle_type,
        vsr.base_price,
        vsr.service_type,
        vsr.created_at
    FROM public.vehicle_service_rate AS vsr
    WHERE vsr.tenant_id = p_tenant_id
      AND vsr.is_active = TRUE
    ORDER BY
        vsr.service_type,
        vsr.vehicle_type;
$$;