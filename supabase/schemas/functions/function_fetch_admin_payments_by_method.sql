-- ============================================================================
-- FUNCIÓN: PAGOS POR MÉTODO DE PAGO
-- Obtiene la cantidad de pagos por método para el tenant autenticado
-- dentro del rango de fechas solicitado.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fetch_admin_payments_by_method(
    p_tenant_id UUID,
    p_fecha_desde date DEFAULT current_date,
    p_fecha_hasta date DEFAULT current_date
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
            enum_range(NULL::public.office_payment_type_enum)
        ) AS enum_value
        LEFT JOIN (
            SELECT
                payment_method,
                SUM(cantidad_pagos)::integer AS cantidad
            FROM public.mv_reportes_contables
            WHERE tenant_id = v_tenant_id
              AND fecha >= p_fecha_desde
              AND fecha <= p_fecha_hasta
            GROUP BY payment_method
        ) counts
            ON counts.payment_method = enum_value
    );

END;
$$;


-- ============================================================================
-- PERMISOS DE EJECUCIÓN
-- ============================================================================

REVOKE ALL
ON FUNCTION public.fetch_admin_payments_by_method(UUID, date, date)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.fetch_admin_payments_by_method(UUID, date, date)
TO authenticated;