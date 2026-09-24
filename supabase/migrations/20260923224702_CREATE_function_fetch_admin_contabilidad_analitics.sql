CREATE OR REPLACE FUNCTION public.fetch_admin_contabilidad_analitics(
    p_mes_solicitado INTEGER,
    p_ano_solicitado INTEGER,
    p_servicio_tipo public.service_type_enum DEFAULT NULL
)
RETURNS TABLE (
    total_recaudado_ayer NUMERIC(12, 2),
    total_recaudado_mes NUMERIC(12, 2),
    total_recaudado_semana NUMERIC(12, 2),
    total_recaudado_anio NUMERIC(12, 2),
    chart_semana JSON,
    chart_mes JSON,
    chart_anio JSON
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;

    -- Fecha actual en Colombia.
    -- La MV solamente contiene datos hasta ayer.
    v_hoy DATE := CURRENT_DATE;

    v_total_recaudado_ayer NUMERIC(12, 2) := 0;
    v_total_recaudado_mes NUMERIC(12, 2) := 0;
    v_total_recaudado_semana NUMERIC(12, 2) := 0;
    v_total_recaudado_anio NUMERIC(12, 2) := 0;

    v_chart_mes JSON;
    v_chart_anio JSON;
    v_chart_semana JSON;

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
    -- PASO 2: TOTAL RECAUDADO AYER
    -- =========================================================================

    SELECT COALESCE(SUM(total_recaudado), 0)::NUMERIC(12, 2)
    INTO v_total_recaudado_ayer
    FROM public.mv_reportes_contables
    WHERE tenant_id = v_tenant_id
      AND fecha = v_hoy - 1
      AND (
          p_servicio_tipo IS NULL
          OR service_type = p_servicio_tipo
      );


    -- =========================================================================
    -- PASO 3: TOTAL RECAUDADO MES ACTUAL HASTA AYER
    -- =========================================================================

    SELECT COALESCE(SUM(total_recaudado), 0)::NUMERIC(12, 2)
    INTO v_total_recaudado_mes
    FROM public.mv_reportes_contables
    WHERE tenant_id = v_tenant_id
      AND fecha >= DATE_TRUNC('month', v_hoy)::DATE
      AND fecha < v_hoy
      AND (
          p_servicio_tipo IS NULL
          OR service_type = p_servicio_tipo
      );


    -- =========================================================================
    -- PASO 4: TOTAL RECAUDADO SEMANA ACTUAL HASTA AYER
    -- =========================================================================

    SELECT COALESCE(SUM(total_recaudado), 0)::NUMERIC(12, 2)
    INTO v_total_recaudado_semana
    FROM public.mv_reportes_contables
    WHERE tenant_id = v_tenant_id
      AND fecha >= DATE_TRUNC('week', v_hoy)::DATE
      AND fecha < v_hoy
      AND (
          p_servicio_tipo IS NULL
          OR service_type = p_servicio_tipo
      );


    -- =========================================================================
    -- PASO 5: TOTAL RECAUDADO AÑO ACTUAL HASTA AYER
    -- =========================================================================

    SELECT COALESCE(SUM(total_recaudado), 0)::NUMERIC(12, 2)
    INTO v_total_recaudado_anio
    FROM public.mv_reportes_contables
    WHERE tenant_id = v_tenant_id
      AND fecha >= DATE_TRUNC('year', v_hoy)::DATE
      AND fecha < v_hoy
      AND (
          p_servicio_tipo IS NULL
          OR service_type = p_servicio_tipo
      );

      -- =========================================================================
-- PASO 6: GRÁFICO DE LA SEMANA ACTUAL
--
-- Genera lunes, martes, miércoles... domingo.
--
-- La MV solamente contiene información hasta ayer, por lo que
-- el día actual aparecerá con 0.
-- =========================================================================

SELECT json_agg(row_to_json(s))
INTO v_chart_semana
FROM (
    WITH todos_los_dias AS (
        SELECT
            orden_dia::DATE AS fecha_calendario
        FROM generate_series(
            DATE_TRUNC('week', v_hoy)::DATE,
            (
                DATE_TRUNC('week', v_hoy)::DATE
                + INTERVAL '6 days'
            )::DATE,
            INTERVAL '1 day'
        ) AS orden_dia
    )

    SELECT

        CASE EXTRACT(ISODOW FROM cal.fecha_calendario)
            WHEN 1 THEN 'Lunes'
            WHEN 2 THEN 'Martes'
            WHEN 3 THEN 'Miércoles'
            WHEN 4 THEN 'Jueves'
            WHEN 5 THEN 'Viernes'
            WHEN 6 THEN 'Sábado'
            WHEN 7 THEN 'Domingo'
        END AS dia,

        EXTRACT(
            ISODOW FROM cal.fecha_calendario
        )::INTEGER AS numero_dia,

        cal.fecha_calendario AS fecha,

        COALESCE(
            SUM(mv.total_recaudado),
            0
        )::NUMERIC(12, 2) AS total

    FROM todos_los_dias cal

    LEFT JOIN public.mv_reportes_contables mv
        ON mv.fecha = cal.fecha_calendario
        AND mv.tenant_id = v_tenant_id
        AND (
            p_servicio_tipo IS NULL
            OR mv.service_type = p_servicio_tipo
        )

    GROUP BY
        cal.fecha_calendario

    ORDER BY
        cal.fecha_calendario

) s;


    -- =========================================================================
    -- PASO 6: GRÁFICO DEL MES SOLICITADO
    -- =========================================================================

    SELECT json_agg(row_to_json(t))
    INTO v_chart_mes
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
                SUM(mv.total_recaudado),
                0
            )::NUMERIC(12, 2) AS total

        FROM todos_los_dias cal

        LEFT JOIN public.mv_reportes_contables mv
            ON mv.fecha = cal.fecha_calendario
            AND mv.tenant_id = v_tenant_id
            AND (
                p_servicio_tipo IS NULL
                OR mv.service_type = p_servicio_tipo
            )

        GROUP BY cal.fecha_calendario

        ORDER BY cal.fecha_calendario

    ) t;


    -- =========================================================================
    -- PASO 7: GRÁFICO DEL AÑO SOLICITADO
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
                SUM(mv.total_recaudado),
                0
            )::NUMERIC(12, 2) AS total

        FROM todos_los_meses cal

        LEFT JOIN public.mv_reportes_contables mv
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
                OR mv.service_type = p_servicio_tipo
            )

        GROUP BY cal.numero_mes

        ORDER BY cal.numero_mes

    ) m;


    -- =========================================================================
    -- PASO 8: DEVOLVER TODO CONSOLIDADO
    -- =========================================================================

    RETURN QUERY
SELECT
    v_total_recaudado_ayer,
    v_total_recaudado_mes,
    v_total_recaudado_semana,
    v_total_recaudado_anio,
    v_chart_semana,
    v_chart_mes,
    v_chart_anio;

END;
$$;