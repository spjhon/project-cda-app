DROP MATERIALIZED VIEW IF EXISTS public.mv_reportes_desglose_precio;

CREATE MATERIALIZED VIEW public.mv_reportes_desglose_precio AS

SELECT
    (ps.created_at AT TIME ZONE 'America/Bogota')::date AS fecha,
    ps.tenant_id,
    eo.service_type,
    eo.vehiculo_tipo_snapshot,

    -- Precio base
    COALESCE(SUM(ps.base_price), 0)::numeric(12,2)           AS base_price,
    COALESCE(SUM(ps.base_price_iva_amount), 0)::numeric(12,2) AS base_iva_amount,

    -- SICOV
    COALESCE(SUM(fees.sicov_amount), 0)::numeric(12,2)       AS fee_sicov_amount,
    COALESCE(SUM(fees.sicov_iva), 0)::numeric(12,2)          AS fee_sicov_iva,

    -- ENTIDAD RECAUDADORA
    COALESCE(SUM(fees.entidad_amount), 0)::numeric(12,2)     AS fee_entidad_amount,
    COALESCE(SUM(fees.entidad_iva), 0)::numeric(12,2)        AS fee_entidad_iva,

    -- COMISIÓN RUNT (IVA siempre 0, pero se expone)
    COALESCE(SUM(fees.runt_amount), 0)::numeric(12,2)        AS fee_runt_amount,
    COALESCE(SUM(fees.runt_iva), 0)::numeric(12,2)           AS fee_runt_iva,

    -- ANSV
    COALESCE(SUM(fees.ansv_amount), 0)::numeric(12,2)        AS fee_ansv_amount,
    COALESCE(SUM(fees.ansv_iva), 0)::numeric(12,2)           AS fee_ansv_iva,

        -- ========================================================
    -- TOTALES DE LA CABECERA (entry_order_price_snapshot)
    -- ========================================================
    COALESCE(SUM(ps.fees_subtotal), 0)::numeric(12,2)        AS fees_subtotal,
    COALESCE(SUM(ps.fees_iva_total), 0)::numeric(12,2)       AS fees_iva_total,
    COALESCE(SUM(ps.subtotal), 0)::numeric(12,2)             AS subtotal,
    COALESCE(SUM(ps.iva_total), 0)::numeric(12,2)            AS iva_total,
    COALESCE(SUM(ps.total), 0)::numeric(12,2)                AS total,

    COUNT(*)::integer                                         AS num_ordenes

FROM public.entry_order_price_snapshot ps

JOIN public.entry_orders eo
    ON eo.id = ps.entry_order_id
   AND eo.tenant_id = ps.tenant_id

LEFT JOIN LATERAL (
    SELECT
        COALESCE(SUM(fs.fee_amount) FILTER (WHERE fs.fee_name = 'sicov'), 0)               AS sicov_amount,
        COALESCE(SUM(fs.iva_amount) FILTER (WHERE fs.fee_name = 'sicov'), 0)               AS sicov_iva,

        COALESCE(SUM(fs.fee_amount) FILTER (WHERE fs.fee_name = 'entidad_recaudadora'), 0) AS entidad_amount,
        COALESCE(SUM(fs.iva_amount) FILTER (WHERE fs.fee_name = 'entidad_recaudadora'), 0) AS entidad_iva,

        COALESCE(SUM(fs.fee_amount) FILTER (WHERE fs.fee_name = 'comision_runt'), 0)       AS runt_amount,
        COALESCE(SUM(fs.iva_amount) FILTER (WHERE fs.fee_name = 'comision_runt'), 0)       AS runt_iva,

        COALESCE(SUM(fs.fee_amount) FILTER (WHERE fs.fee_name = 'ansv'), 0)                AS ansv_amount,
        COALESCE(SUM(fs.iva_amount) FILTER (WHERE fs.fee_name = 'ansv'), 0)                AS ansv_iva
    FROM public.entry_order_fee_snapshot fs
    WHERE fs.entry_order_price_snapshot_id = ps.id
      AND fs.tenant_id = ps.tenant_id
) fees ON TRUE

WHERE eo.deleted_at IS NULL
  AND eo.estado_orden = 'finalizada'::public.order_status_enum
  AND (eo.es_reinspeccion = false OR eo.es_reinspeccion IS NULL)
  AND (ps.created_at AT TIME ZONE 'America/Bogota')::date < (
        CURRENT_TIMESTAMP AT TIME ZONE 'America/Bogota'
      )::date

GROUP BY
    (ps.created_at AT TIME ZONE 'America/Bogota')::date,
    ps.tenant_id,
    eo.service_type,
    eo.vehiculo_tipo_snapshot;






-- Índice único para REFRESH CONCURRENTLY
CREATE UNIQUE INDEX idx_mv_reportes_desglose_precio
ON public.mv_reportes_desglose_precio (
    fecha,
    tenant_id,
    service_type,
    vehiculo_tipo_snapshot
);

-- Primer refresco
REFRESH MATERIALIZED VIEW public.mv_reportes_desglose_precio;