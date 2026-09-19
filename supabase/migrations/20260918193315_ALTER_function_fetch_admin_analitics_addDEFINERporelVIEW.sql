CREATE OR REPLACE FUNCTION public.fetch_admin_analitics(
    p_mes_solicitado INTEGER,
    p_ano_solicitado INTEGER,
    p_servicio_tipo public.service_type_enum DEFAULT NULL
)
RETURNS TABLE (
    -- Datos RTM
    total_rtm_ayer INTEGER,
    total_rtm_mes INTEGER,
    total_rtm_anio INTEGER,
    chart_mes JSON,
    chart_anio JSON,

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
    -- PASO 2: TOTALES SIMPLES (RTM GENERAL)
    -- Estos siempre representan el período actual.
    -- =========================================================================

    -- Total de ayer
    SELECT COALESCE(SUM(cantidad), 0)::INTEGER
    INTO v_total_ayer
    FROM public.mv_reportes_diarios
    WHERE tenant_id = v_tenant_id
      AND (
    p_servicio_tipo IS NULL
    OR service_type = p_servicio_tipo
)
      AND fecha = v_hoy - 1;


    -- Total del mes actual hasta ayer
    SELECT COALESCE(SUM(cantidad), 0)::INTEGER
    INTO v_total_mes
    FROM public.mv_reportes_diarios
    WHERE tenant_id = v_tenant_id
      AND (
    p_servicio_tipo IS NULL
    OR service_type = p_servicio_tipo
)
      AND fecha >= DATE_TRUNC('month', v_hoy)::DATE
      AND fecha < v_hoy;


    -- Total del año actual hasta ayer
    SELECT COALESCE(SUM(cantidad), 0)::INTEGER
    INTO v_total_anio
    FROM public.mv_reportes_diarios
    WHERE tenant_id = v_tenant_id
      AND (
    p_servicio_tipo IS NULL
    OR service_type = p_servicio_tipo
)
      AND fecha >= DATE_TRUNC('year', v_hoy)::DATE
      AND fecha < v_hoy;


    -- =========================================================================
    -- PASO 2.1: TOTALES SIMPLES (RECHAZOS)
    -- Estos siempre representan el período actual.
    -- =========================================================================

    -- Rechazados de ayer
    SELECT COALESCE(SUM(cantidad), 0)::INTEGER
    INTO v_total_rechazado_ayer
    FROM public.mv_reportes_diarios
    WHERE tenant_id = v_tenant_id
      AND (
    p_servicio_tipo IS NULL
    OR service_type = p_servicio_tipo
)
      AND resultado_revision = 'rechazado'
      AND fecha = v_hoy - 1;


    -- Rechazados del mes actual hasta ayer
    SELECT COALESCE(SUM(cantidad), 0)::INTEGER
    INTO v_total_rechazado_mes
    FROM public.mv_reportes_diarios
    WHERE tenant_id = v_tenant_id
      AND (
    p_servicio_tipo IS NULL
    OR service_type = p_servicio_tipo
)
      AND resultado_revision = 'rechazado'
      AND fecha >= DATE_TRUNC('month', v_hoy)::DATE
      AND fecha < v_hoy;


    -- Rechazados del año actual hasta ayer
    SELECT COALESCE(SUM(cantidad), 0)::INTEGER
    INTO v_total_rechazado_anio
    FROM public.mv_reportes_diarios
    WHERE tenant_id = v_tenant_id
      AND (
    p_servicio_tipo IS NULL
    OR service_type = p_servicio_tipo
)
      AND resultado_revision = 'rechazado'
      AND fecha >= DATE_TRUNC('year', v_hoy)::DATE
      AND fecha < v_hoy;


    -- =========================================================================
    -- PASO 3: GRÁFICO DEL MES (RTM GENERAL)
    -- =========================================================================

    --el json_agg agrega en un solo object todos los row to json de la consulta interna t
    SELECT json_agg(row_to_json(t))
    INTO v_chart_mes
    FROM (
        --aqui basicamente dice: Genérame una fila por cada día del mes solicitado.
        WITH todos_los_dias AS (
            SELECT orden_dia::DATE AS fecha_calendario --el ::Date transforma un string en un timestamp
            FROM generate_series(
                --aqui esta aramndo el dia 1 del mes y el año solicitado
                make_date(
                    p_ano_solicitado,
                    p_mes_solicitado,
                    1
                ),
                --aqui esta calculando el ultimo dia llendo hasta el otro mes y restandole un dia
                (
                    make_date(
                        p_ano_solicitado,
                        p_mes_solicitado,
                        1
                    )
                    + INTERVAL '1 month'
                    - INTERVAL '1 day'
                )::DATE,
                INTERVAL '1 day'
            ) AS orden_dia
        )
        SELECT --para entender mejor el select es, haz el tratamiento a todos los rows que esta a continuacion
        --con las condiciones de from y group y where y todo eso
        --este to char es el que cambia de fecha 2026-02-01 a solamente el dia 01
            TO_CHAR(
                cal.fecha_calendario,
                'DD'
            ) AS dia,
            p_mes_solicitado AS mes,
            p_ano_solicitado AS ano,
            COALESCE(
                SUM(mv.cantidad),
                0
            )::INTEGER AS total
        FROM todos_los_dias cal
        LEFT JOIN public.mv_reportes_diarios mv
            ON mv.fecha = cal.fecha_calendario
            AND mv.tenant_id = v_tenant_id
            AND (
    p_servicio_tipo IS NULL
    OR service_type = p_servicio_tipo
)
        GROUP BY cal.fecha_calendario
        ORDER BY cal.fecha_calendario
    ) t;


    -- =========================================================================
    -- PASO 3.1: GRÁFICO DEL MES (RECHAZOS)
    -- =========================================================================

    SELECT json_agg(row_to_json(tr))
    INTO v_chart_rechazado_mes
    FROM (
        WITH todos_los_dias AS (
            SELECT orden_dia::DATE AS fecha_calendario
            FROM generate_series(
                make_date(
                    p_ano_solicitado,
                    p_mes_solicitado,
                    1
                ),
                (
                    make_date(
                        p_ano_solicitado,
                        p_mes_solicitado,
                        1
                    )
                    + INTERVAL '1 month'
                    - INTERVAL '1 day'
                )::DATE,
                INTERVAL '1 day'
            ) AS orden_dia
        )

        SELECT
            TO_CHAR(
                cal.fecha_calendario,
                'DD'
            ) AS dia,

            p_mes_solicitado AS mes,

            p_ano_solicitado AS ano,

            COALESCE(
                SUM(mv.cantidad),
                0
            )::INTEGER AS total

        FROM todos_los_dias cal

        LEFT JOIN public.mv_reportes_diarios mv
            ON mv.fecha = cal.fecha_calendario
            AND mv.tenant_id = v_tenant_id
            AND (
    p_servicio_tipo IS NULL
    OR service_type = p_servicio_tipo
)
            AND mv.resultado_revision = 'rechazado'

        GROUP BY cal.fecha_calendario

        ORDER BY cal.fecha_calendario
    ) tr;


    -- =========================================================================
    -- PASO 4: GRÁFICO DEL AÑO (RTM GENERAL)
    -- =========================================================================

    SELECT json_agg(row_to_json(m))
    INTO v_chart_anio
    FROM (
        WITH todos_los_meses AS (
            SELECT orden_mes AS numero_mes
            FROM generate_series(1, 12) AS orden_mes
        )

        SELECT
            CASE cal.numero_mes
                WHEN 1 THEN 'Enero'
                WHEN 2 THEN 'Febrero'
                WHEN 3 THEN 'Marzo'
                WHEN 4 THEN 'Abril'
                WHEN 5 THEN 'Mayo'
                WHEN 6 THEN 'Junio'
                WHEN 7 THEN 'Julio'
                WHEN 8 THEN 'Agosto'
                WHEN 9 THEN 'Septiembre'
                WHEN 10 THEN 'Octubre'
                WHEN 11 THEN 'Noviembre'
                WHEN 12 THEN 'Diciembre'
            END AS mes,

            cal.numero_mes AS numero_mes,

            p_ano_solicitado AS ano,

            COALESCE(
                SUM(mv.cantidad),
                0
            )::INTEGER AS total

        FROM todos_los_meses cal

        LEFT JOIN public.mv_reportes_diarios mv
            ON mv.fecha >= make_date(
                p_ano_solicitado,
                cal.numero_mes,
                1
            )
            AND mv.fecha < (
                make_date(
                    p_ano_solicitado,
                    cal.numero_mes,
                    1
                )
                + INTERVAL '1 month'
            )::DATE
            AND mv.tenant_id = v_tenant_id
            AND (
    p_servicio_tipo IS NULL
    OR service_type = p_servicio_tipo
)

        GROUP BY cal.numero_mes

        ORDER BY cal.numero_mes
    ) m;


    -- =========================================================================
    -- PASO 4.1: GRÁFICO DEL AÑO (RECHAZOS)
    -- =========================================================================

    SELECT json_agg(row_to_json(mr))
    INTO v_chart_rechazado_anio
    FROM (
        WITH todos_los_meses AS (
            SELECT orden_mes AS numero_mes
            FROM generate_series(1, 12) AS orden_mes
        )

        SELECT
            CASE cal.numero_mes
                WHEN 1 THEN 'Enero'
                WHEN 2 THEN 'Febrero'
                WHEN 3 THEN 'Marzo'
                WHEN 4 THEN 'Abril'
                WHEN 5 THEN 'Mayo'
                WHEN 6 THEN 'Junio'
                WHEN 7 THEN 'Julio'
                WHEN 8 THEN 'Agosto'
                WHEN 9 THEN 'Septiembre'
                WHEN 10 THEN 'Octubre'
                WHEN 11 THEN 'Noviembre'
                WHEN 12 THEN 'Diciembre'
            END AS mes,

            cal.numero_mes AS numero_mes,

            p_ano_solicitado AS ano,

            COALESCE(
                SUM(mv.cantidad),
                0
            )::INTEGER AS total

        FROM todos_los_meses cal

        LEFT JOIN public.mv_reportes_diarios mv
            ON mv.fecha >= make_date(
                p_ano_solicitado,
                cal.numero_mes,
                1
            )
            AND mv.fecha < (
                make_date(
                    p_ano_solicitado,
                    cal.numero_mes,
                    1
                )
                + INTERVAL '1 month'
            )::DATE
            AND mv.tenant_id = v_tenant_id
            AND (
    p_servicio_tipo IS NULL
    OR service_type = p_servicio_tipo
)
            AND mv.resultado_revision = 'rechazado'

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

