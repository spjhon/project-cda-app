DROP MATERIALIZED VIEW IF EXISTS public.mv_reportes_contables;

CREATE MATERIALIZED VIEW public.mv_reportes_contables AS

SELECT
  (eo.created_at AT TIME ZONE 'America/Bogota')::date AS fecha,
  eop.tenant_id,
  eo.service_type,
  eo.vehiculo_tipo_snapshot,
  eop.payment_method,
  count(*)::integer AS cantidad_pagos,
  COALESCE(sum(eop.monto_bruto), 0)::numeric(12, 2) AS total_recaudado

FROM entry_order_payments eop

JOIN entry_orders eo
  ON eo.id = eop.entry_order_id

WHERE
  eo.deleted_at IS NULL

  -- La orden debe estar cerrada, no abierta
  AND eo.estado_orden <> 'abierta'::order_status_enum

  -- No contar órdenes anuladas
  AND eo.estado_orden <> 'anulada'::order_status_enum

  -- No contar reinspecciones
  AND (
    eo.es_reinspeccion = false
    OR eo.es_reinspeccion IS NULL
  )

  -- Solo días contables anteriores al día actual
  AND (
    eo.created_at AT TIME ZONE 'America/Bogota'
  )::date < (
    CURRENT_TIMESTAMP AT TIME ZONE 'America/Bogota'
  )::date

GROUP BY
  (eo.created_at AT TIME ZONE 'America/Bogota')::date,
  eop.tenant_id,
  eo.service_type,
  eo.vehiculo_tipo_snapshot,
  eop.payment_method;

REVOKE SELECT ON public.mv_reportes_contables
FROM public, anon, authenticated;

REFRESH MATERIALIZED VIEW public.mv_reportes_contables;