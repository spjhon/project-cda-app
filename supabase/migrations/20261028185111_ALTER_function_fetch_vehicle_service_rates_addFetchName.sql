
-- ============================================================
-- RPC: OBTENER TODAS LAS TARIFAS DE SERVICIOS
-- ============================================================
--
-- Devuelve todas las tarifas pertenecientes al tenant indicado,
-- independientemente de si están activas o inactivas.
--
-- Incluye:
--   - Identificador y nombre descriptivo de la tarifa
--   - Tenant al que pertenece
--   - Tipo de vehículo y precio base
--   - IVA aplicado al precio base
--   - Tipo de servicio
--   - Estado activo/inactivo
--   - Fecha de creación
--   - Fuels asociados
--   - Classes asociadas
--   - Service types asociados
--   - Fees asociados, incluyendo sus respectivos datos e IVA
--   - Empresas relacionadas
--
-- Las relaciones se devuelven como arreglos JSONB para mantener
-- una sola fila por cada tarifa.
--
-- Las relaciones sin registros se devuelven como arreglos vacíos
-- ([]), evitando valores NULL en las colecciones.
--
-- Los resultados se limitan al tenant indicado y se ordenan por
-- tipo de servicio, tipo de vehículo y fecha de creación.
-- ============================================================

DROP FUNCTION IF EXISTS public.fetch_vehicle_service_rates(UUID);

CREATE OR REPLACE FUNCTION public.fetch_vehicle_service_rates(
    p_tenant_id UUID
)
RETURNS TABLE (
    id UUID,
    tenant_id UUID,
    name TEXT,
    vehicle_type public.vehicle_type_enum,
    base_price NUMERIC(12,2),
    iva_percentage NUMERIC(5,2),
    service_type public.service_type_enum,
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,

    fuels JSONB,
    classes JSONB,
    service_types JSONB,
    fees JSONB,
    companies JSONB
)

LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public

AS $$

    SELECT
        vsr.id,
        vsr.tenant_id,
        vsr.name,
        vsr.vehicle_type,
        vsr.base_price,
        vsr.iva_percentage,
        vsr.service_type,
        vsr.is_active,
        vsr.created_at,

        -- ====================================================
        -- FUELS
        -- ====================================================
        -- Combustibles asociados a la tarifa.
        -- Devuelve un arreglo vacío si no existen relaciones.
        -- ====================================================

        COALESCE(
            (
                SELECT jsonb_agg(
                    vsrf.fuel_type
                    ORDER BY vsrf.fuel_type
                )
                FROM public.vehicle_service_rate_fuels AS vsrf
                WHERE vsrf.vehicle_service_rate_id = vsr.id
                  AND vsrf.tenant_id = vsr.tenant_id
            ),
            '[]'::JSONB
        ) AS fuels,

        -- ====================================================
        -- CLASSES
        -- ====================================================
        -- Clases de vehículo asociadas a la tarifa.
        -- ====================================================

        COALESCE(
            (
                SELECT jsonb_agg(
                    vsrc.vehicle_class
                    ORDER BY vsrc.vehicle_class
                )
                FROM public.vehicle_service_rate_classes AS vsrc
                WHERE vsrc.vehicle_service_rate_id = vsr.id
                  AND vsrc.tenant_id = vsr.tenant_id
            ),
            '[]'::JSONB
        ) AS classes,

        -- ====================================================
        -- SERVICE TYPES
        -- ====================================================
        -- Tipos de servicio vehicular asociados a la tarifa.
        -- ====================================================

        COALESCE(
            (
                SELECT jsonb_agg(
                    vsrst.service_type
                    ORDER BY vsrst.service_type
                )
                FROM public.vehicle_service_rate_service_types AS vsrst
                WHERE vsrst.vehicle_service_rate_id = vsr.id
                  AND vsrst.tenant_id = vsr.tenant_id
            ),
            '[]'::JSONB
        ) AS service_types,

        -- ====================================================
        -- FEES
        -- ====================================================
        -- Cargos adicionales asociados a la tarifa.
        -- Incluye el nombre, descripción, importe, IVA y rangos
        -- de antigüedad del vehículo, además de sus fechas.
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
                  AND ft.tenant_id = vsr.tenant_id
            ),
            '[]'::JSONB
        ) AS fees,

        -- ====================================================
        -- EMPRESAS RELACIONADAS
        -- ====================================================
        -- Devuelve el identificador y nombre de cada empresa
        -- relacionada con la tarifa.
        --
        -- Excluye las empresas eliminadas lógicamente.
        -- ====================================================

        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', tc.id,
                        'name', tc.name
                    )
                    ORDER BY tc.name
                )
                FROM public.vehicle_service_rate_companies AS vsrc
                INNER JOIN public.tenants_company AS tc
                    ON tc.id = vsrc.company_id
                   AND tc.tenant_id = vsrc.tenant_id
                WHERE vsrc.vehicle_service_rate_id = vsr.id
                  AND vsrc.tenant_id = vsr.tenant_id
                  AND tc.tenant_id = vsr.tenant_id
                  AND tc.deleted_at IS NULL
            ),
            '[]'::JSONB
        ) AS companies

    FROM public.vehicle_service_rate AS vsr

    WHERE vsr.tenant_id = p_tenant_id

    ORDER BY
        vsr.service_type,
        vsr.vehicle_type,
        vsr.created_at;

$$;
