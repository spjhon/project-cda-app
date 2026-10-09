CREATE UNIQUE INDEX idx_mv_reportes_contables_unique
ON public.mv_reportes_contables (
  fecha,
  tenant_id,
  service_type,
  vehiculo_tipo_snapshot,
  payment_method
);