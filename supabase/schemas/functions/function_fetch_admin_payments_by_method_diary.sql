-- ============================================================================
-- FUNCIÓN: PAGOS POR MÉTODO - DÍA ACTUAL
-- Obtiene la cantidad de pagos realizados hoy por cada método de pago
-- para el tenant del usuario autenticado.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fetch_admin_payments_by_method_diary()
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
    -- PASO 2: OBTENER CANTIDAD DE PAGOS POR MÉTODO
    -- =========================================================================

    RETURN (
        SELECT jsonb_object_agg(
            enum_value::text,
            COALESCE(counts.cantidad, 0)
        )
        FROM unnest(
            enum_range(
                NULL::public.office_payment_type_enum
            )
        ) AS enum_value

        LEFT JOIN (
            SELECT
                eop.payment_method,
                COUNT(*)::integer AS cantidad
            FROM public.entry_order_payments AS eop
            INNER JOIN public.entry_orders AS eo
                ON eo.id = eop.entry_order_id
            WHERE eop.tenant_id = v_tenant_id
              AND eo.deleted_at IS NULL
              AND eo.estado_orden IS DISTINCT FROM 'anulada'
              AND (
                  eo.es_reinspeccion = false
                  OR eo.es_reinspeccion IS NULL
              )
              AND (
                  eop.created_at AT TIME ZONE 'America/Bogota'
              )::date = (
                  CURRENT_TIMESTAMP AT TIME ZONE 'America/Bogota'
              )::date
            GROUP BY eop.payment_method
        ) counts
            ON counts.payment_method = enum_value
    );

END;
$$;


-- ============================================================================
-- PERMISOS DE EJECUCIÓN
-- ============================================================================

REVOKE ALL
ON FUNCTION public.fetch_admin_payments_by_method_diary()
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.fetch_admin_payments_by_method_diary()
TO authenticated;