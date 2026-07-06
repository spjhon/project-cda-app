

CREATE OR REPLACE FUNCTION public.fetch_admin_analitics()
RETURNS TABLE (
    -- Datos Originales RTM
    total_rtm_ayer INTEGER,
    total_rtm_mes_actual INTEGER,
    total_rtm_anio_actual INTEGER,
    chart_mes_actual JSON, 
    chart_anio_actual JSON,
    
    -- Datos de Rechazos
    total_rechazado_ayer INTEGER,
    total_rechazado_mes INTEGER,
    total_rechazado_anio INTEGER,
    chart_rechazado_mes JSON, 
    chart_rechazado_anio JSON 
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
    v_hoy DATE := CURRENT_DATE;
    
    -- Variables para los totales simples (RTM)
    v_total_ayer INTEGER := 0;
    v_total_mes INTEGER := 0;
    v_total_anio INTEGER := 0;
    
    -- Variables para los totales simples (Rechazos)
    v_total_rechazado_ayer INTEGER := 0;
    v_total_rechazado_mes INTEGER := 0;
    v_total_rechazado_anio INTEGER := 0;
    
    -- Variables para los JSON de los gráficos (RTM)
    v_chart_mes JSON;
    v_chart_anio JSON;
    
    -- Variables para los JSON de los gráficos (Rechazos)
    v_chart_rechazado_mes JSON;
    v_chart_rechazado_anio JSON;
BEGIN
    -- =========================================================================
    -- PASO 1: Identificar al Tenant de forma segura
    -- =========================================================================
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
    -- PASO 2: TOTALES SIMPLES (RTM GENERAL)
    -- =========================================================================
    SELECT COALESCE(SUM(cantidad), 0)::INTEGER INTO v_total_ayer
    FROM public.mv_reportes_diarios
    WHERE tenant_id = v_tenant_id AND service_type = 'RTM' AND fecha = v_hoy - 1;

    SELECT COALESCE(SUM(cantidad), 0)::INTEGER INTO v_total_mes
    FROM public.mv_reportes_diarios
    WHERE tenant_id = v_tenant_id AND service_type = 'RTM' 
      AND fecha >= DATE_TRUNC('month', v_hoy)::DATE AND fecha < v_hoy;

    SELECT COALESCE(SUM(cantidad), 0)::INTEGER INTO v_total_anio
    FROM public.mv_reportes_diarios
    WHERE tenant_id = v_tenant_id AND service_type = 'RTM' 
      AND fecha >= DATE_TRUNC('year', v_hoy)::DATE AND fecha < v_hoy;


    -- =========================================================================
    -- PASO 2.1: TOTALES SIMPLES (RECHAZOS)
    -- =========================================================================
    -- Ahora filtramos por servicio RTM pero con resultado_revision = 'Rechazado'
    
    SELECT COALESCE(SUM(cantidad), 0)::INTEGER INTO v_total_rechazado_ayer
    FROM public.mv_reportes_diarios
    WHERE tenant_id = v_tenant_id 
      AND service_type = 'RTM' 
      AND resultado_revision = 'rechazado' 
      AND fecha = v_hoy - 1;

    SELECT COALESCE(SUM(cantidad), 0)::INTEGER INTO v_total_rechazado_mes
    FROM public.mv_reportes_diarios
    WHERE tenant_id = v_tenant_id 
      AND service_type = 'RTM' 
      AND resultado_revision = 'rechazado'
      AND fecha >= DATE_TRUNC('month', v_hoy)::DATE AND fecha < v_hoy;

    SELECT COALESCE(SUM(cantidad), 0)::INTEGER INTO v_total_rechazado_anio
    FROM public.mv_reportes_diarios
    WHERE tenant_id = v_tenant_id 
      AND service_type = 'RTM' 
      AND resultado_revision = 'rechazado'
      AND fecha >= DATE_TRUNC('year', v_hoy)::DATE AND fecha < v_hoy;


    -- =========================================================================
    -- PASO 3: GRÁFICO DEL MES (RTM GENERAL)
    -- =========================================================================
    SELECT json_agg(row_to_json(t)) INTO v_chart_mes
    FROM (
        WITH todos_los_dias AS (
            SELECT orden_dia::DATE as fecha_calendario
            FROM generate_series(
                DATE_TRUNC('month', v_hoy)::DATE,
                (DATE_TRUNC('month', v_hoy) + INTERVAL '1 month' - INTERVAL '1 day')::DATE,
                INTERVAL '1 day'
            ) AS orden_dia
        )
        SELECT 
            TO_CHAR(cal.fecha_calendario, 'DD') as dia,
            COALESCE(SUM(mv.cantidad), 0)::INTEGER as total
        FROM todos_los_dias cal
        LEFT JOIN public.mv_reportes_diarios mv ON mv.fecha = cal.fecha_calendario 
            AND mv.tenant_id = v_tenant_id 
            AND mv.service_type = 'RTM'
            AND cal.fecha_calendario < v_hoy 
        GROUP BY cal.fecha_calendario
        ORDER BY cal.fecha_calendario
    ) t;


    -- =========================================================================
    -- PASO 3.1: GRÁFICO DEL MES (RECHAZOS)
    -- =========================================================================
    SELECT json_agg(row_to_json(tr)) INTO v_chart_rechazado_mes
    FROM (
        WITH todos_los_dias AS (
            SELECT orden_dia::DATE as fecha_calendario
            FROM generate_series(
                DATE_TRUNC('month', v_hoy)::DATE,
                (DATE_TRUNC('month', v_hoy) + INTERVAL '1 month' - INTERVAL '1 day')::DATE,
                INTERVAL '1 day'
            ) AS orden_dia
        )
        SELECT 
            TO_CHAR(cal.fecha_calendario, 'DD') as dia,
            COALESCE(SUM(mv.cantidad), 0)::INTEGER as total_rechazado
        FROM todos_los_dias cal
        LEFT JOIN public.mv_reportes_diarios mv ON mv.fecha = cal.fecha_calendario 
            AND mv.tenant_id = v_tenant_id 
            AND mv.service_type = 'RTM' 
            AND mv.resultado_revision = 'rechazado' -- ◄ Filtro de campo añadido
            AND cal.fecha_calendario < v_hoy 
        GROUP BY cal.fecha_calendario
        ORDER BY cal.fecha_calendario
    ) tr;


    -- =========================================================================
    -- PASO 4: GRÁFICO DEL AÑO (RTM GENERAL)
    -- =========================================================================
    SELECT json_agg(row_to_json(m)) INTO v_chart_anio
    FROM (
        WITH todos_los_meses AS (
            SELECT orden_mes as numero_mes
            FROM generate_series(1, 12) AS orden_mes
        )
        SELECT 
            CASE cal.numero_mes
                WHEN 1 THEN 'Enero' WHEN 2 THEN 'Febrero' WHEN 3 THEN 'Marzo'
                WHEN 4 THEN 'Abril' WHEN 5 THEN 'Mayo' WHEN 6 THEN 'Junio'
                WHEN 7 THEN 'Julio' WHEN 8 THEN 'Agosto' WHEN 9 THEN 'Septiembre'
                WHEN 10 THEN 'Octubre' WHEN 11 THEN 'Noviembre' WHEN 12 THEN 'Diciembre'
            END as mes,
            COALESCE(SUM(mv.cantidad), 0)::INTEGER as total
        FROM todos_los_meses cal
        LEFT JOIN public.mv_reportes_diarios mv ON EXTRACT(MONTH FROM mv.fecha) = cal.numero_mes
            AND EXTRACT(YEAR FROM mv.fecha) = EXTRACT(YEAR FROM v_hoy)
            AND mv.tenant_id = v_tenant_id 
            AND mv.service_type = 'RTM'
            AND mv.fecha < v_hoy 
        GROUP BY cal.numero_mes
        ORDER BY cal.numero_mes
    ) m;


    -- =========================================================================
    -- PASO 4.1: GRÁFICO DEL AÑO (RECHAZOS)
    -- =========================================================================
    SELECT json_agg(row_to_json(mr)) INTO v_chart_rechazado_anio
    FROM (
        WITH todos_los_meses AS (
            SELECT orden_mes as numero_mes
            FROM generate_series(1, 12) AS orden_mes
        )
        SELECT 
            CASE cal.numero_mes
                WHEN 1 THEN 'Enero' WHEN 2 THEN 'Febrero' WHEN 3 THEN 'Marzo'
                WHEN 4 THEN 'Abril' WHEN 5 THEN 'Mayo' WHEN 6 THEN 'Junio'
                WHEN 7 THEN 'Julio' WHEN 8 THEN 'Agosto' WHEN 9 THEN 'Septiembre'
                WHEN 10 THEN 'Octubre' WHEN 11 THEN 'Noviembre' WHEN 12 THEN 'Diciembre'
            END as mes,
            COALESCE(SUM(mv.cantidad), 0)::INTEGER as total_rechazado
        FROM todos_los_meses cal
        LEFT JOIN public.mv_reportes_diarios mv ON EXTRACT(MONTH FROM mv.fecha) = cal.numero_mes
            AND EXTRACT(YEAR FROM mv.fecha) = EXTRACT(YEAR FROM v_hoy)
            AND mv.tenant_id = v_tenant_id 
            AND mv.service_type = 'RTM' 
            AND mv.resultado_revision = 'rechazado' -- ◄ Filtro de campo añadido
            AND mv.fecha < v_hoy 
        GROUP BY cal.numero_mes
        ORDER BY cal.numero_mes
    ) mr;


    -- =========================================================================
    -- PASO 5: DEVOLVER TODO CONSOLIDADO
    -- =========================================================================
    RETURN QUERY 
    SELECT 
        v_total_ayer, 
        v_total_mes, 
        v_total_anio, 
        v_chart_mes, 
        v_chart_anio,
        v_total_rechazado_ayer,
        v_total_rechazado_mes,
        v_total_rechazado_anio,
        v_chart_rechazado_mes,
        v_chart_rechazado_anio;

END;
$$;

GRANT EXECUTE ON FUNCTION public.fetch_admin_analitics() TO authenticated;