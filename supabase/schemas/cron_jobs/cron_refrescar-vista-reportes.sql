-- 1. Asegurar que la extensión pg_cron esté activa en la base de datos
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- 2. Limpiar el cron si ya existía para evitar duplicados en futuras migraciones
SELECT cron.unschedule('refrescar-vista-reportes') 
WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'refrescar-vista-reportes'
);

-- 2. Crear nuevamente el cron a las 00:02 hora Colombia
-- pg_cron está configurado en GMT.
-- 05:02 GMT = 00:02 Colombia.
SELECT cron.schedule(
    'refrescar-vista-reportes',
    '2 5 * * *',
    $$ REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_reportes_diarios; $$
);