DROP FUNCTION IF EXISTS public.fetch_admin_analitics_diary();




-- =========================================================================
-- CREACIÓN DE LA FUNCIÓN
-- =========================================================================

CREATE OR REPLACE FUNCTION public.fetch_admin_analitics_diary(
    p_servicio_tipo public.service_type_enum DEFAULT NULL
)
RETURNS TABLE (
    total_rtm_hoy INTEGER,
    total_rtm_rechazados_hoy INTEGER
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;

    -- Inicio y fin del día actual
    v_hoy_inicio TIMESTAMP WITH TIME ZONE := DATE_TRUNC('day', NOW());
    v_hoy_fin TIMESTAMP WITH TIME ZONE := DATE_TRUNC('day', NOW()) + INTERVAL '1 day';

    -- Variables de conteo
    v_total_hoy INTEGER := 0;
    v_total_rechazados_hoy INTEGER := 0;

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
    -- PASO 2: CÁLCULO DEL TOTAL DE HOY
    -- =========================================================================

    SELECT COUNT(*)::INTEGER
    INTO v_total_hoy
    FROM public.entry_orders
    WHERE tenant_id = v_tenant_id

      -- Si llega NULL, incluye todos los tipos de servicio.
      -- Si llega RTM, preventiva o peritaje, filtra únicamente ese servicio.
      AND (
          p_servicio_tipo IS NULL
          OR service_type = p_servicio_tipo
      )

      AND deleted_at IS NULL

      -- Solo primeras inspecciones
      AND (
          es_reinspeccion = false
          OR es_reinspeccion IS NULL
      )

      AND fecha >= v_hoy_inicio
      AND fecha < v_hoy_fin;


    -- =========================================================================
    -- PASO 3: CÁLCULO DE RECHAZADAS HOY
    -- =========================================================================

    SELECT COUNT(*)::INTEGER
    INTO v_total_rechazados_hoy
    FROM public.entry_orders
    WHERE tenant_id = v_tenant_id

      -- Mismo filtro de tipo de servicio
      AND (
          p_servicio_tipo IS NULL
          OR service_type = p_servicio_tipo
      )

      AND resultado_revision = 'rechazado'
      AND deleted_at IS NULL

      -- Excluir reinspecciones
      AND (
          es_reinspeccion = false
          OR es_reinspeccion IS NULL
      )

      AND fecha >= v_hoy_inicio
      AND fecha < v_hoy_fin;


    -- =========================================================================
    -- PASO 4: RETORNAR RESULTADOS
    -- =========================================================================

    RETURN QUERY
    SELECT
        v_total_hoy,
        v_total_rechazados_hoy;

END;
$$;
