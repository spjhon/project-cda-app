SELECT
    grantee,
    privilege_type
FROM information_schema.routine_privileges
WHERE routine_name = 'fetch_order_rate';