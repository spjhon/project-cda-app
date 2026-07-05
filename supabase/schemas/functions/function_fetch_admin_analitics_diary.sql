CREATE OR REPLACE FUNCTION public.fetch_admin_analitics_diary()
RETURNS TABLE (
    total_rtm_hoy INTEGER
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
    v_hoy_inicio TIMESTAMP WITH TIME ZONE := DATE_TRUNC('day', NOW());
    v_hoy_fin TIMESTAMP WITH TIME ZONE := DATE_TRUNC('day', NOW()) + INTERVAL '1 day';
    v_total_hoy INTEGER := 0;
BEGIN
    -- Paso 1: Identificar al Tenant de forma segura mediante el usuario logueado
    SELECT tp.tenant_id INTO v_tenant_id
    FROM public.service_users su
    INNER JOIN public.tenant_permissions tp ON tp.service_user_id = su.id
    WHERE su.auth_user_id = auth.uid()
      AND su.is_active = true
    LIMIT 1;

    -- Paso 2: Validar que el usuario pertenezca a un tenant activo
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Acceso denegado: Usuario no vinculado a un tenant activo.';
    END IF;

    -- Paso 3: Extraer directamente de la tabla transaccional lo que va del día de hoy
    -- Usamos el rango >= inicio de hoy y < inicio de mañana para aprovechar al máximo entry_orders_fecha_idx
    SELECT COUNT(*)::INTEGER INTO v_total_hoy
    FROM public.entry_orders
    WHERE tenant_id = v_tenant_id
      AND service_type = 'RTM'
      AND deleted_at IS NULL
      AND (es_reinspeccion = false OR es_reinspeccion IS NULL) -- ◄ Solo primeras inspecciones (dinero)
      AND fecha >= v_hoy_inicio
      AND fecha < v_hoy_fin;

    -- Paso 4: Retornar el total fresco del día
    RETURN QUERY SELECT v_total_hoy;
END;
$$;

-- Otorgar permisos de ejecución para usuarios logueados
GRANT EXECUTE ON FUNCTION public.fetch_admin_analitics_diary() TO authenticated;