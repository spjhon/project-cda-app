SELECT
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n
    ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
      'update_office_order_data',
      'fetch_entry_orders_list',
      'get_entry_orders_for_export'
  )
ORDER BY p.proname;