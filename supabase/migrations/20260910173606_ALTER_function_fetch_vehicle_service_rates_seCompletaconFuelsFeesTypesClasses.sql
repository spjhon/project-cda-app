DROP FUNCTION IF EXISTS public.fetch_active_vehicle_service_rates(
    UUID
);

-- ============================================================
-- RPC: OBTENER TODAS LAS TARIFAS DE SERVICIOS
-- ============================================================
--
-- Devuelve todas las tarifas pertenecientes al tenant indicado,
-- independientemente de si están activas o inactivas.
--
-- Incluye:
--   - Datos principales de la tarifa
--   - IVA del precio base
--   - Estado activo/inactivo
--   - Fuels asociados
--   - Classes asociadas
--   - Service types asociados
--   - Fees asociados
--
-- Las relaciones se devuelven como arreglos JSONB para mantener
-- una sola fila por cada tarifa.
-- ============================================================

CREATE OR REPLACE FUNCTION public.fetch_vehicle_service_rates(
    p_tenant_id UUID
)
RETURNS TABLE (
    id UUID,
    tenant_id UUID,
    vehicle_type public.vehicle_type_enum,
    base_price NUMERIC(12,2),
    iva_percentage NUMERIC(5,2),
    service_type public.service_type_enum,
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,

    fuels JSONB,
    classes JSONB,
    service_types JSONB,
    fees JSONB
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
        vsr.iva_percentage,
        vsr.service_type,
        vsr.is_active,
        vsr.created_at,

        -- ====================================================
        -- FUELS
        -- ====================================================

        COALESCE(
            (
                SELECT jsonb_agg(
                    vsrf.fuel_type
                    ORDER BY vsrf.fuel_type
                )
                FROM public.vehicle_service_rate_fuels AS vsrf
                WHERE vsrf.vehicle_service_rate_id = vsr.id
            ),
            '[]'::JSONB
        ) AS fuels,

        -- ====================================================
        -- CLASSES
        -- ====================================================

        COALESCE(
            (
                SELECT jsonb_agg(
                    vsrc.vehicle_class
                    ORDER BY vsrc.vehicle_class
                )
                FROM public.vehicle_service_rate_classes AS vsrc
                WHERE vsrc.vehicle_service_rate_id = vsr.id
            ),
            '[]'::JSONB
        ) AS classes,

        -- ====================================================
        -- SERVICE TYPES
        -- ====================================================

        COALESCE(
            (
                SELECT jsonb_agg(
                    vsrst.service_type
                    ORDER BY vsrst.service_type
                )
                FROM public.vehicle_service_rate_service_types AS vsrst
                WHERE vsrst.vehicle_service_rate_id = vsr.id
            ),
            '[]'::JSONB
        ) AS service_types,

        -- ====================================================
        -- FEES
        -- ====================================================

        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', ft.id,
                        'tenant_id', ft.tenant_id,
                        'name', ft.name,
                        'description', ft.description,
                        'fee_amount', ft.fee_amount,
                        'iva_percentage', ft.iva_percentage,
                        'vehicle_age_from', ft.vehicle_age_from,
                        'vehicle_age_to', ft.vehicle_age_to,
                        'created_at', ft.created_at,
                        'updated_at', ft.updated_at
                    )
                    ORDER BY ft.created_at
                )
                FROM public.fee_types AS ft
                WHERE ft.vehicle_service_rate_id = vsr.id
            ),
            '[]'::JSONB
        ) AS fees

    FROM public.vehicle_service_rate AS vsr

    WHERE vsr.tenant_id = p_tenant_id

    ORDER BY
        vsr.service_type,
        vsr.vehicle_type,
        vsr.created_at;

$$;