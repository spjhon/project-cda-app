
-- ============================================================================
-- FUNCIÓN: VEHÍCULOS POR TIPO
-- Obtiene la cantidad de RTM por tipo de vehículo para el tenant seleccionado.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fetch_admin_vehicles_by_type(
    p_tenant_id uuid,
    p_fecha_desde date DEFAULT current_date,
    p_fecha_hasta date DEFAULT current_date
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_tenant_id UUID;
BEGIN

    -- =========================================================================
    -- PASO 1: VALIDAR EL TENANT SOLICITADO
    -- =========================================================================

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

    v_tenant_id := p_tenant_id;

    -- =========================================================================
    -- PASO 2: OBTENER CANTIDADES POR TIPO DE VEHÍCULO
    -- =========================================================================

    RETURN (
        SELECT jsonb_object_agg(
            enum_value::text,
            COALESCE(counts.cantidad, 0)
        )
        FROM unnest(
            enum_range(NULL::public.vehicle_type_enum)
        ) AS enum_value

        LEFT JOIN (
            SELECT
                vehiculo_tipo_snapshot AS vehicle_type,
                SUM(cantidad)::integer AS cantidad
            FROM public.mv_reportes_diarios
            WHERE tenant_id = v_tenant_id
              AND service_type = 'RTM'
              AND fecha >= p_fecha_desde
              AND fecha <= p_fecha_hasta
            GROUP BY vehiculo_tipo_snapshot
        ) counts
            ON counts.vehicle_type = enum_value
    );

END;
$$;

-- ============================================================================
-- PERMISOS DE EJECUCIÓN
-- ============================================================================

REVOKE ALL
ON FUNCTION public.fetch_admin_vehicles_by_type(uuid, date, date)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.fetch_admin_vehicles_by_type(uuid, date, date)
TO authenticated;
