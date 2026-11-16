
-- ============================================================
-- 3. REFRESCAR LAS VISTAS MATERIALIZADAS
-- ============================================================
REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_reportes_diarios;
REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_reportes_contables;
REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_reportes_desglose_precio;
