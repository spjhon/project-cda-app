CREATE MATERIALIZED VIEW public.mv_reportes_diarios AS
SELECT 
    DATE_TRUNC('day', fecha)::DATE as fecha,
    tenant_id,
    service_type,                 -- 'RTM', 'PREVENTIVA', etc.
    resultado_revision,           -- Resultado del peritaje/RTM
    vehiculo_tipo_snapshot,       -- Tu enum: liviano, pesado, motocicleta_4t, etc.
    se_compro_soat,               -- boolean: true / false ◄ ¡Nueva Dimensión!
    COUNT(*)::INTEGER as cantidad
FROM public.entry_orders
-- Filtro de seguridad por buenas prácticas: Ignorar registros borrados lógicamente (soft deletes)
WHERE deleted_at IS NULL
GROUP BY 
    DATE_TRUNC('day', fecha)::DATE, 
    tenant_id, 
    service_type, 
    resultado_revision, 
    vehiculo_tipo_snapshot, 
    se_compro_soat;

-- Creamos el índice único que cruza todas las dimensiones para permitir REFRESH CONCURRENTLY
CREATE UNIQUE INDEX idx_mv_reportes_diarios 
ON public.mv_reportes_diarios (fecha, tenant_id, service_type, resultado_revision, vehiculo_tipo_snapshot, se_compro_soat);