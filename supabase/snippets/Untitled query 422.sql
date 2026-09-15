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
  AND (
      eo.es_reinspeccion = false
      OR eo.es_reinspeccion IS NULL
  )

GROUP BY
    DATE_TRUNC('day', eop.created_at)::DATE,
    eop.tenant_id,
    eo.service_type,
    eo.vehiculo_tipo_snapshot,
    eop.payment_method;
