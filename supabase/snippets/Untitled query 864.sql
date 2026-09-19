SELECT
    p.proname,
    pg_get_userbyid(p.proowner) AS owner
FROM pg_proc p
WHERE p.proname = 'fetch_admin_analitics';