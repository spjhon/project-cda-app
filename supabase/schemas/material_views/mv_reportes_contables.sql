CREATE MATERIALIZED VIEW public.mv_reportes_contables AS
SELECT
    DATE_TRUNC('day', eop.created_at)::DATE AS fecha,
    eop.tenant_id,
    eo.service_type,
    eo.vehiculo_tipo_snapshot,
    eop.payment_method,
    COUNT(*)::INTEGER AS cantidad_pagos,
    COALESCE(
        SUM(eop.monto_bruto),
        0
    )::NUMERIC(12, 2) AS total_recaudado
FROM public.entry_order_payments AS eop
INNER JOIN public.entry_orders AS eo
    ON eo.id = eop.entry_order_id
WHERE eo.deleted_at IS NULL
  AND eo.estado_orden IS DISTINCT FROM 'anulada'
  AND (
      eo.es_reinspeccion = false
      OR eo.es_reinspeccion IS NULL
  )
  AND (
    eop.created_at AT TIME ZONE 'America/Bogota'
)::DATE < (
    CURRENT_TIMESTAMP AT TIME ZONE 'America/Bogota'
)::DATE
GROUP BY
    DATE_TRUNC('day', eop.created_at)::DATE,
    eop.tenant_id,
    eo.service_type,
    eo.vehiculo_tipo_snapshot,
    eop.payment_method
ORDER BY fecha DESC;

CREATE UNIQUE INDEX idx_mv_reportes_contables
ON public.mv_reportes_contables (
    fecha,
    tenant_id,
    service_type,
    vehiculo_tipo_snapshot,
    payment_method
);

REVOKE SELECT ON public.mv_reportes_contables
FROM public, anon, authenticated;

REFRESH MATERIALIZED VIEW public.mv_reportes_contables;