CREATE OR REPLACE FUNCTION public.fetch_admin_payments_by_method_diary(
    p_tenant_id UUID
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
BEGIN
    -- =========================================================================
    -- PASO 1: IDENTIFICAR AL TENANT DE FORMA SEGURA
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

              -- La orden no debe estar eliminada.
              AND eo.deleted_at IS NULL

              -- La orden no debe estar abierta ni anulada.
              AND eo.estado_orden <> 'abierta'::order_status_enum
              AND eo.estado_orden <> 'anulada'::order_status_enum

              -- Excluir reinspecciones.
              AND (
                  eo.es_reinspeccion = false
                  OR eo.es_reinspeccion IS NULL
              )

              -- La fecha contable es la fecha de creación de la orden.
              -- NO la fecha en que se registró el payment.
              AND (
                  eo.created_at AT TIME ZONE 'America/Bogota'
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
ON FUNCTION public.fetch_admin_payments_by_method_diary(UUID)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.fetch_admin_payments_by_method_diary(UUID)
TO authenticated;