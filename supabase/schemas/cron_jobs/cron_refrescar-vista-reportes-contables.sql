-- Limpiar el cron si ya existía
SELECT cron.unschedule('refrescar-vista-reportes-contables')
WHERE EXISTS (
    SELECT 1
    FROM cron.job
    WHERE jobname = 'refrescar-vista-reportes-contables'
);

-- Refrescar la MV todos los días a las 00:02 hora Colombia
-- pg_cron está configurado en GMT.
-- 05:02 GMT = 00:02 Colombia.

SELECT cron.schedule(
    'refrescar-vista-reportes-contables',
    '2 5 * * *',
    $$ REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_reportes_contables; $$
);