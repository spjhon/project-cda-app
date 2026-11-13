-- Ver dependencias (vistas, funciones, policies, etc.) que usan esas columnas
SELECT
  dependent_ns.nspname AS schema_dependiente,
  dependent_view.relname AS objeto_dependiente,
  dependent_view.relkind AS tipo
FROM pg_depend
JOIN pg_rewrite ON pg_depend.objid = pg_rewrite.oid
JOIN pg_class dependent_view ON pg_rewrite.ev_class = dependent_view.oid
JOIN pg_namespace dependent_ns ON dependent_view.relnamespace = dependent_ns.oid
JOIN pg_attribute
  ON pg_attribute.attrelid = pg_depend.refobjid
 AND pg_attribute.attnum = pg_depend.refobjsubid
JOIN pg_class source_table ON source_table.oid = pg_depend.refobjid
WHERE source_table.relname = 'entry_orders'
  AND pg_attribute.attname IN (
    'vehiculo_modelo_snapshot',
    'vehiculo_clase_snapshot',
    'vehiculo_combustible_snapshot'
  );