CREATE OR REPLACE FUNCTION public.fetch_admin_analitics()
RETURNS TABLE (
    total_rtm_ayer INTEGER,
    total_rtm_mes_actual INTEGER,
    total_rtm_anio_actual INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
    v_hoy DATE := CURRENT_DATE;
    
    -- Variables independientes para guardar cada conteo
    v_total_ayer INTEGER := 0;
    v_total_mes INTEGER := 0;
    v_total_anio INTEGER := 0;
BEGIN
    -- Paso 1: Encontrar el tenant_id del usuario logueado (auth.uid())
    SELECT tp.tenant_id INTO v_tenant_id
    FROM public.service_users su
    INNER JOIN public.tenant_permissions tp ON tp.service_user_id = su.id
    WHERE su.auth_user_id = auth.uid()
      AND su.is_active = true
    LIMIT 1;

    -- Paso 2: Si no encontramos un tenant asignado, paramos el proceso
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Acceso denegado: Usuario no vinculado a un tenant activo.';
    END IF;

    -- Paso 3: Calcular el total de AYER
    SELECT COALESCE(SUM(cantidad), 0)::INTEGER INTO v_total_ayer
    FROM public.mv_reportes_diarios
    WHERE tenant_id = v_tenant_id 
      AND service_type = 'RTM' 
      AND fecha = v_hoy - 1;

    -- Paso 4: Calcular el total del MES ACTUAL
    SELECT COALESCE(SUM(cantidad), 0)::INTEGER INTO v_total_mes
    FROM public.mv_reportes_diarios
    WHERE tenant_id = v_tenant_id 
      AND service_type = 'RTM' 
      AND fecha >= DATE_TRUNC('month', v_hoy)::DATE
      AND fecha <= v_hoy;

    -- Paso 5: Calcular el total del AÑO ACTUAL
    SELECT COALESCE(SUM(cantidad), 0)::INTEGER INTO v_total_anio
    FROM public.mv_reportes_diarios
    WHERE tenant_id = v_tenant_id 
      AND service_type = 'RTM' 
      AND fecha >= DATE_TRUNC('year', v_hoy)::DATE
      AND fecha <= v_hoy;

    -- Paso 6: Devolver las variables ordenadas en el formato que pide el RETURNS TABLE
    RETURN QUERY 
    SELECT v_total_ayer, v_total_mes, v_total_anio;

END;
$$;


-- Otorgamos el permiso de ejecución al rol autenticado
GRANT EXECUTE ON FUNCTION public.fetch_admin_analitics() TO authenticated;