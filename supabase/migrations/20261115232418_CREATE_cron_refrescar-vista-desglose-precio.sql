-- ============================================================
-- CRON: Refrescar mv_reportes_desglose_precio
-- ============================================================
-- Refresca la materialized view todos los días a las 00:02
-- hora Colombia.
--
-- pg_cron está configurado en GMT.
-- 05:02 GMT = 00:02 Colombia (UTC-5).
-- ============================================================

-- Limpiar el cron si ya existía (idempotente)
SELECT cron.unschedule('refrescar-vista-desglose-precio')
WHERE EXISTS (
    SELECT 1
    FROM cron.job
    WHERE jobname = 'refrescar-vista-desglose-precio'
);

-- Programar el refresh diario
SELECT cron.schedule(
    'refrescar-vista-desglose-precio',
    '1 5 * * *',
    $$ REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_reportes_desglose_precio; $$
);