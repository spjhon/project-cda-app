UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"tenants": ["admin"]}'::jsonb
WHERE email = 'spjhon@gmail.com';