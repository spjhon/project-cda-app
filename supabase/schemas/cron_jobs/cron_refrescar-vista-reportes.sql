-- 1. Asegurar que la extensión pg_cron esté activa en la base de datos
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- 2. Limpiar el cron si ya existía para evitar duplicados en futuras migraciones
SELECT cron.unschedule('refrescar-vista-reportes') 
WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'refrescar-vista-reportes'
);

-- 3. Programar el cron job de forma segura
-- Nota: 05:00 UTC equivale a las 00:00 (Medianoche) en Colombia (COT)
SELECT cron.schedule(
  'refrescar-vista-reportes', 
  '0 5 * * *', 
  $$ REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_reportes_diarios; $$
);