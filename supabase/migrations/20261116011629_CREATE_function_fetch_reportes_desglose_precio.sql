DROP FUNCTION IF EXISTS public.fetch_reportes_desglose_precio(UUID, INTEGER, INTEGER, public.service_type_enum);

CREATE OR REPLACE FUNCTION public.fetch_reportes_desglose_precio(
    p_tenant_id     UUID,
    p_ano           INTEGER,
    p_mes           INTEGER,
    p_service_type  public.service_type_enum DEFAULT NULL
)
RETURNS TABLE (
    chart_mes   JSON,
    chart_anio  JSON
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_valido BOOLEAN;
    v_chart_mes  JSON;
    v_chart_anio JSON;
BEGIN
    -- ========================================================
    -- 1. Validar tenant
    -- ========================================================
    SELECT EXISTS (
        SELECT 1
        FROM public.service_users su
        INNER JOIN public.tenant_permissions tp
            ON tp.service_user_id = su.id
        WHERE su.auth_user_id = (SELECT auth.uid())
          AND su.is_active = true
          AND tp.tenant_id = p_tenant_id
    ) INTO v_tenant_valido;

    IF NOT v_tenant_valido THEN
        RAISE EXCEPTION
            'Acceso denegado: el usuario no tiene permisos para este tenant.';
    END IF;

    -- ========================================================
    -- 2. Validar mes y año
    -- ========================================================
    IF p_mes < 1 OR p_mes > 12 THEN
        RAISE EXCEPTION 'Mes inválido: % (debe estar entre 1 y 12)', p_mes;
    END IF;

    IF p_ano < 2000 OR p_ano > 2100 THEN
        RAISE EXCEPTION 'Año inválido: %', p_ano;
    END IF;

    -- ========================================================
    -- 3. CHART DEL MES: todos los días del mes (1 al 28/29/30/31)
    -- ========================================================
    SELECT json_agg(row_to_json(d) ORDER BY d.fecha)
    INTO v_chart_mes
    FROM (
        WITH todos_los_dias AS (
            SELECT orden_dia::DATE AS fecha_calendario
            FROM generate_series(
                make_date(p_ano, p_mes, 1),
                (
                    make_date(p_ano, p_mes, 1)
                    + INTERVAL '1 month'
                    - INTERVAL '1 day'
                )::DATE,
                INTERVAL '1 day'
            ) AS orden_dia
        )
        SELECT
            cal.fecha_calendario AS fecha,
            EXTRACT(DAY FROM cal.fecha_calendario)::INTEGER AS dia,
            COALESCE(SUM(mv.base_price), 0)::numeric(12,2)             AS base_price,
            COALESCE(SUM(mv.base_iva_amount), 0)::numeric(12,2)        AS base_iva_amount,
            MAX(mv.base_iva_percentage)::numeric(5,2)                  AS base_iva_percentage,
            COALESCE(SUM(mv.fee_sicov_amount), 0)::numeric(12,2)       AS fee_sicov_amount,
            COALESCE(SUM(mv.fee_sicov_iva), 0)::numeric(12,2)          AS fee_sicov_iva,
            MAX(mv.fee_sicov_iva_percentage)::numeric(5,2)             AS fee_sicov_iva_percentage,
            COALESCE(SUM(mv.fee_entidad_amount), 0)::numeric(12,2)     AS fee_entidad_amount,
            COALESCE(SUM(mv.fee_entidad_iva), 0)::numeric(12,2)        AS fee_entidad_iva,
            MAX(mv.fee_entidad_iva_percentage)::numeric(5,2)           AS fee_entidad_iva_percentage,
            COALESCE(SUM(mv.fee_runt_amount), 0)::numeric(12,2)        AS fee_runt_amount,
            COALESCE(SUM(mv.fee_runt_iva), 0)::numeric(12,2)           AS fee_runt_iva,
            MAX(mv.fee_runt_iva_percentage)::numeric(5,2)              AS fee_runt_iva_percentage,
            COALESCE(SUM(mv.fee_ansv_amount), 0)::numeric(12,2)        AS fee_ansv_amount,
            COALESCE(SUM(mv.fee_ansv_iva), 0)::numeric(12,2)           AS fee_ansv_iva,
            MAX(mv.fee_ansv_iva_percentage)::numeric(5,2)              AS fee_ansv_iva_percentage,
            COALESCE(SUM(mv.fees_subtotal), 0)::numeric(12,2)          AS fees_subtotal,
            COALESCE(SUM(mv.fees_iva_total), 0)::numeric(12,2)         AS fees_iva_total,
            COALESCE(SUM(mv.subtotal), 0)::numeric(12,2)               AS subtotal,
            COALESCE(SUM(mv.iva_total), 0)::numeric(12,2)              AS iva_total,
            COALESCE(SUM(mv.total), 0)::numeric(12,2)                  AS total,
            COALESCE(SUM(mv.num_ordenes), 0)::INTEGER                  AS num_ordenes
        FROM todos_los_dias cal
        LEFT JOIN public.mv_reportes_desglose_precio mv
            ON mv.fecha = cal.fecha_calendario
            AND mv.tenant_id = p_tenant_id
            AND (p_service_type IS NULL OR mv.service_type = p_service_type)
        GROUP BY cal.fecha_calendario
    ) d;

    -- ========================================================
    -- 4. CHART DEL AÑO: todos los meses (1 al 12)
    -- ========================================================
    SELECT json_agg(row_to_json(m) ORDER BY m.numero_mes)
    INTO v_chart_anio
    FROM (
        WITH todos_los_meses AS (
            SELECT orden_mes AS numero_mes
            FROM generate_series(1, 12) AS orden_mes
        )
        SELECT
            cal.numero_mes AS numero_mes,
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
            END AS mes_nombre,
            COALESCE(SUM(mv.base_price), 0)::numeric(12,2)             AS base_price,
            COALESCE(SUM(mv.base_iva_amount), 0)::numeric(12,2)        AS base_iva_amount,
            MAX(mv.base_iva_percentage)::numeric(5,2)                  AS base_iva_percentage,
            COALESCE(SUM(mv.fee_sicov_amount), 0)::numeric(12,2)       AS fee_sicov_amount,
            COALESCE(SUM(mv.fee_sicov_iva), 0)::numeric(12,2)          AS fee_sicov_iva,
            MAX(mv.fee_sicov_iva_percentage)::numeric(5,2)             AS fee_sicov_iva_percentage,
            COALESCE(SUM(mv.fee_entidad_amount), 0)::numeric(12,2)     AS fee_entidad_amount,
            COALESCE(SUM(mv.fee_entidad_iva), 0)::numeric(12,2)        AS fee_entidad_iva,
            MAX(mv.fee_entidad_iva_percentage)::numeric(5,2)           AS fee_entidad_iva_percentage,
            COALESCE(SUM(mv.fee_runt_amount), 0)::numeric(12,2)        AS fee_runt_amount,
            COALESCE(SUM(mv.fee_runt_iva), 0)::numeric(12,2)           AS fee_runt_iva,
            MAX(mv.fee_runt_iva_percentage)::numeric(5,2)              AS fee_runt_iva_percentage,
            COALESCE(SUM(mv.fee_ansv_amount), 0)::numeric(12,2)        AS fee_ansv_amount,
            COALESCE(SUM(mv.fee_ansv_iva), 0)::numeric(12,2)           AS fee_ansv_iva,
            MAX(mv.fee_ansv_iva_percentage)::numeric(5,2)              AS fee_ansv_iva_percentage,
            COALESCE(SUM(mv.fees_subtotal), 0)::numeric(12,2)          AS fees_subtotal,
            COALESCE(SUM(mv.fees_iva_total), 0)::numeric(12,2)         AS fees_iva_total,
            COALESCE(SUM(mv.subtotal), 0)::numeric(12,2)               AS subtotal,
            COALESCE(SUM(mv.iva_total), 0)::numeric(12,2)              AS iva_total,
            COALESCE(SUM(mv.total), 0)::numeric(12,2)                  AS total,
            COALESCE(SUM(mv.num_ordenes), 0)::INTEGER                  AS num_ordenes
        FROM todos_los_meses cal
        LEFT JOIN public.mv_reportes_desglose_precio mv
            ON mv.fecha >= make_date(p_ano, cal.numero_mes, 1)
           AND mv.fecha <  (make_date(p_ano, cal.numero_mes, 1) + INTERVAL '1 month')::DATE
           AND mv.tenant_id = p_tenant_id
           AND (p_service_type IS NULL OR mv.service_type = p_service_type)
        GROUP BY cal.numero_mes
    ) m;

    -- ========================================================
    -- 5. Devolver ambos JSONs
    -- ========================================================
    RETURN QUERY
    SELECT COALESCE(v_chart_mes, '[]'::json), COALESCE(v_chart_anio, '[]'::json);
END;
$$;

-- ============================================================
-- PERMISOS
-- ============================================================
REVOKE EXECUTE ON FUNCTION public.fetch_reportes_desglose_precio(UUID, INTEGER, INTEGER, public.service_type_enum) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fetch_reportes_desglose_precio(UUID, INTEGER, INTEGER, public.service_type_enum) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fetch_reportes_desglose_precio(UUID, INTEGER, INTEGER, public.service_type_enum) TO service_role;