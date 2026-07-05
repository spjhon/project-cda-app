DROP FUNCTION IF EXISTS public.fetch_admin_analitics();

CREATE OR REPLACE FUNCTION public.fetch_admin_analitics()
RETURNS TABLE (
    total_rtm_ayer INTEGER,
    total_rtm_mes_actual INTEGER,
    total_rtm_anio_actual INTEGER,
    chart_mes_actual JSON, -- ◄ Arreglo de días: [{ "dia": "01", "total": 5 }, ...]
    chart_anio_actual JSON -- ◄ Arreglo de meses: [{ "mes": "Enero", "total": 120 }, ...]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
    v_hoy DATE := CURRENT_DATE;
    
    -- Variables para los totales simples
    v_total_ayer INTEGER := 0;
    v_total_mes INTEGER := 0;
    v_total_anio INTEGER := 0;
    
    -- Variables nuevas para los JSON de los gráficos
    v_chart_mes JSON;
    v_chart_anio JSON;
BEGIN
    -- Paso 1: Identificar al Tenant de forma segura
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
    -- PASO 2: TOTALES SIMPLES (Tu lógica anterior)
    -- =========================================================================
    SELECT COALESCE(SUM(cantidad), 0)::INTEGER INTO v_total_ayer
    FROM public.mv_reportes_diarios
    WHERE tenant_id = v_tenant_id AND service_type = 'RTM' AND fecha = v_hoy - 1;

    SELECT COALESCE(SUM(cantidad), 0)::INTEGER INTO v_total_mes
    FROM public.mv_reportes_diarios
    WHERE tenant_id = v_tenant_id AND service_type = 'RTM' 
      AND fecha >= DATE_TRUNC('month', v_hoy)::DATE AND fecha < v_hoy; -- Excluimos hoy

    SELECT COALESCE(SUM(cantidad), 0)::INTEGER INTO v_total_anio
    FROM public.mv_reportes_diarios
    WHERE tenant_id = v_tenant_id AND service_type = 'RTM' 
      AND fecha >= DATE_TRUNC('year', v_hoy)::DATE AND fecha < v_hoy; -- Excluimos hoy


    -- =========================================================================
    -- PASO 3: GRÁFICO DEL MES (Día por día, rellenando con 0)
    -- =========================================================================
    -- recuerda: row to json sirve para transformar todo un row en un object del array del json
    SELECT json_agg(row_to_json(t)) INTO v_chart_mes
    FROM (
        -- Generamos todos los días del mes actual (ej: del 2026-07-01 al 2026-07-31)
        -- Paso 1: Comprar el organizador vacío (generate_series)
        /*
        tenemos una tabla que se llama todos_los_dias con un field que se llama fecha calendario y 31 filas que tienen los dias en formato year-month-day
        */
        /*
        La Analogía: WITH es el const de SQL
        */
        WITH todos_los_dias AS (
            SELECT orden_dia::DATE as fecha_calendario
            /*
            Postgres ejecuta internamente un proceso hiperoptimizado que genera una lista (un conjunto) de 31 filas. En ese instante exacto, 
            la tabla temporal en memoria llamada todos_los_dias (a la que le pusimos el alias cal)
            */
            FROM generate_series(
                --con el trunk tipo month se le dice que de la fecha de hoy extraiga el año y el mes pero no el dia, entonces se reseta a 1
                DATE_TRUNC('month', v_hoy)::DATE,
                --este es el ultimo dia del mes
                (DATE_TRUNC('month', v_hoy) + INTERVAL '1 month' - INTERVAL '1 day')::DATE,
                INTERVAL '1 day'
            ) AS orden_dia
        )
        -- Cruzamos el calendario contra nuestra vista materializada
        SELECT 
            TO_CHAR(cal.fecha_calendario, 'DD') as dia, -- Nos da '01', '02', '03'...
            COALESCE(SUM(mv.cantidad), 0)::INTEGER as total
        FROM todos_los_dias cal
        LEFT JOIN public.mv_reportes_diarios mv ON mv.fecha = cal.fecha_calendario 
            AND mv.tenant_id = v_tenant_id 
            AND mv.service_type = 'RTM'
            AND cal.fecha_calendario < v_hoy -- Como pediste, excluimos hoy (queda en 0 temporalmente)
        GROUP BY cal.fecha_calendario
        ORDER BY cal.fecha_calendario
    ) t; -- ◄ Toda esta subconsulta se llama "t"


    -- =========================================================================
    -- PASO 4: GRÁFICO DEL AÑO (Mes por mes, de Enero a Diciembre con 0)
    -- =========================================================================
    SELECT json_agg(row_to_json(m)) INTO v_chart_anio
    FROM (
        -- Generamos los 12 meses del año actual (1 al 12)
        WITH todos_los_meses AS (
            SELECT orden_mes as numero_mes
            FROM generate_series(1, 12) AS orden_mes
        )
        SELECT 
            -- Convertimos el número al nombre del mes en español
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
            AND mv.fecha < v_hoy -- Filtro para no acumular lo que va de hoy en el mes actual
        GROUP BY cal.numero_mes
        ORDER BY cal.numero_mes
    ) m;


    -- =========================================================================
    -- PASO 5: DEVOLVER TODO CONSOLIDADO
    -- =========================================================================
    RETURN QUERY 
    SELECT v_total_ayer, v_total_mes, v_total_anio, v_chart_mes, v_chart_anio;

END;
$$;

GRANT EXECUTE ON FUNCTION public.fetch_admin_analitics() TO authenticated;