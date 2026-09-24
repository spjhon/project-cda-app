CREATE OR REPLACE FUNCTION public.fetch_admin_contabilidad_diary(
    p_servicio_tipo public.service_type_enum DEFAULT NULL
)
RETURNS TABLE (
    total_recaudado_hoy NUMERIC(12, 2)
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;

    -- Inicio y fin del día actual en la zona horaria de la sesión.
    v_hoy_inicio TIMESTAMP WITH TIME ZONE := DATE_TRUNC('day', NOW());
    v_hoy_fin TIMESTAMP WITH TIME ZONE := DATE_TRUNC('day', NOW()) + INTERVAL '1 day';

    v_total_recaudado_hoy NUMERIC(12, 2) := 0;

BEGIN

    -- =========================================================================
    -- PASO 1: VALIDACIÓN DE TENANT
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
    -- PASO 2: RECAUDO DE HOY
    -- =========================================================================

    SELECT COALESCE(
        SUM(eop.monto_bruto),
        0
    )::NUMERIC(12, 2)

    INTO v_total_recaudado_hoy

    FROM public.entry_order_payments AS eop

    INNER JOIN public.entry_orders AS eo
        ON eo.id = eop.entry_order_id

    WHERE eop.tenant_id = v_tenant_id

      -- Filtro por servicio.
      AND (
          p_servicio_tipo IS NULL
          OR eo.service_type = p_servicio_tipo
      )

      -- La orden no debe estar eliminada.
      AND eo.deleted_at IS NULL

      -- No contar órdenes anuladas.
      AND eo.estado_orden IS DISTINCT FROM 'anulada'

      -- Excluir reinspecciones.
      AND (
          eo.es_reinspeccion = false
          OR eo.es_reinspeccion IS NULL
      )

      -- El pago fue creado hoy.
      AND eop.created_at >= v_hoy_inicio
      AND eop.created_at < v_hoy_fin;


    -- =========================================================================
    -- PASO 3: RETORNAR RESULTADO
    -- =========================================================================

    RETURN QUERY
    SELECT
        v_total_recaudado_hoy;

END;
$$;