CREATE MATERIALIZED VIEW public.mv_reportes_diarios AS
SELECT 
    DATE_TRUNC('day', fecha)::DATE as fecha,
    tenant_id,
    service_type,                 -- 'RTM', 'PREVENTIVA', etc.
    resultado_revision,           -- 'APROBADO', 'REPROBADO', etc.
    vehiculo_tipo_snapshot,       -- liviano, pesado, motocicleta_4t, etc.
    se_compro_soat,               -- boolean: true / false
    COUNT(*)::INTEGER as cantidad
FROM public.entry_orders
WHERE deleted_at IS NULL
  -- ◄ REFINAMIENTO: Solo contar órdenes de primera vez (las que generan dinero)
  AND (es_reinspeccion = false OR es_reinspeccion IS NULL)
GROUP BY 
    DATE_TRUNC('day', fecha)::DATE, 
    tenant_id, 
    service_type, 
    resultado_revision, 
    vehiculo_tipo_snapshot, 
    se_compro_soat;

-- 3. Volver a crear el índice único para permitir REFRESH CONCURRENTLY
CREATE UNIQUE INDEX idx_mv_reportes_diarios 
ON public.mv_reportes_diarios (fecha, tenant_id, service_type, resultado_revision, vehiculo_tipo_snapshot, se_compro_soat);

-- 4. Ejecutar el primer refresco manual para poblar la vista con los nuevos filtros
REFRESH MATERIALIZED VIEW public.mv_reportes_diarios;