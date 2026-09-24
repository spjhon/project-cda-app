drop materialized view if exists public.mv_reportes_diarios;

create materialized view public.mv_reportes_diarios as

select
  date_trunc('day', fecha)::date as fecha,
  tenant_id,
  service_type,
  resultado_revision,
  vehiculo_tipo_snapshot,
  se_compro_soat,
  count(*)::integer as cantidad

from entry_orders

where deleted_at is null
  and estado_orden is distinct from 'anulada'
  and (
    es_reinspeccion = false
    or es_reinspeccion is null
  )

group by
  date_trunc('day', fecha)::date,
  tenant_id,
  service_type,
  resultado_revision,
  vehiculo_tipo_snapshot,
  se_compro_soat;

-- 3. Volver a crear el índice único para permitir REFRESH CONCURRENTLY
CREATE UNIQUE INDEX idx_mv_reportes_diarios 
ON public.mv_reportes_diarios (fecha, tenant_id, service_type, resultado_revision, vehiculo_tipo_snapshot, se_compro_soat);