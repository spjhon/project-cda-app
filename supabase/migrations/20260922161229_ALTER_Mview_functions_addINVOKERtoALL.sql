REVOKE SELECT ON public.mv_reportes_diarios
FROM public, anon, authenticated;


-- ============================================================================
-- FUNCIÓN: VEHÍCULOS POR TIPO
-- Obtiene la cantidad de RTM por tipo de vehículo para el tenant autenticado.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fetch_admin_vehicles_by_type(
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
    -- PASO 1: IDENTIFICAR AL TENANT DE FORMA SEGURA
    -- =========================================================================

    SELECT tp.tenant_id
    INTO v_tenant_id
    FROM public.service_users su
    INNER JOIN public.tenant_permissions tp
        ON tp.service_user_id = su.id
    WHERE su.auth_user_id = auth.uid()
      AND su.is_active = true
    LIMIT 1;

    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION
            'Acceso denegado: Usuario no vinculado a un tenant activo.';
    END IF;


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
ON FUNCTION public.fetch_admin_vehicles_by_type(date, date)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.fetch_admin_vehicles_by_type(date, date)
TO authenticated;