-- =========================================================================
-- DROPS
-- =========================================================================
-- Borrar la versión anterior para permitir el cambio en las columnas del RETURNS TABLE
DROP FUNCTION IF EXISTS public.fetch_admin_analitics_diary();

-- =========================================================================
-- CREACIÓN DE LA FUNCIÓN
-- =========================================================================
CREATE OR REPLACE FUNCTION public.fetch_admin_analitics_diary()
RETURNS TABLE (
    total_rtm_hoy INTEGER,
    total_rtm_rechazados_hoy INTEGER -- ◄ Nueva columna agregada
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
    v_hoy_inicio TIMESTAMP WITH TIME ZONE := DATE_TRUNC('day', NOW());
    v_hoy_fin TIMESTAMP WITH TIME ZONE := DATE_TRUNC('day', NOW()) + INTERVAL '1 day';
    
    -- Variables de conteo
    v_total_hoy INTEGER := 0;
    v_total_rechazados_hoy INTEGER := 0; -- ◄ Nueva variable
BEGIN
    -- =========================================================================
    -- PASO 1: VALIDACIÓN DE TENANT
    -- =========================================================================
    -- Identificar al Tenant de forma segura mediante el usuario logueado
    SELECT tp.tenant_id INTO v_tenant_id
    FROM public.service_users su
    INNER JOIN public.tenant_permissions tp ON tp.service_user_id = su.id
    WHERE su.auth_user_id = auth.uid()
      AND su.is_active = true
    LIMIT 1;

    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Acceso denegado: Usuario no vinculado a un tenant activo.';
    END IF;

    -- =========================================================================
    -- PASO 2: CÁLCULO DE RTM TOTALES HOY (Aprobados y Rechazados)
    -- =========================================================================
    -- Extraer directamente de la tabla transaccional lo que va del día de hoy
    SELECT COUNT(*)::INTEGER INTO v_total_hoy
    FROM public.entry_orders
    WHERE tenant_id = v_tenant_id
      AND service_type = 'RTM'
      AND deleted_at IS NULL
      AND (es_reinspeccion = false OR es_reinspeccion IS NULL) -- Solo primeras inspecciones
      AND fecha >= v_hoy_inicio
      AND fecha < v_hoy_fin;

    -- =========================================================================
    -- PASO 3: CÁLCULO DE RTM RECHAZADAS HOY
    -- =========================================================================
    SELECT COUNT(*)::INTEGER INTO v_total_rechazados_hoy
    FROM public.entry_orders
    WHERE tenant_id = v_tenant_id
      AND service_type = 'RTM'
      AND resultado_revision = 'rechazado' -- ◄ Valor exacto en minúscula como solicitaste
      AND deleted_at IS NULL
      AND (es_reinspeccion = false OR es_reinspeccion IS NULL) -- Seguimos excluyendo reinspecciones
      AND fecha >= v_hoy_inicio
      AND fecha < v_hoy_fin;

    -- =========================================================================
    -- PASO 4: RETORNAR RESULTADOS
    -- =========================================================================
    RETURN QUERY SELECT v_total_hoy, v_total_rechazados_hoy;
END;
$$;

-- Otorgar permisos de ejecución para usuarios logueados
GRANT EXECUTE ON FUNCTION public.fetch_admin_analitics_diary() TO authenticated;