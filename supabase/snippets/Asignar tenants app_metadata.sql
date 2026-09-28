UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  raw_app_meta_data,
  '{tenants}',
  COALESCE(raw_app_meta_data->'tenants', '[]'::jsonb) || '["demo"]'::jsonb
)
WHERE id = '6d8e0129-ce35-4e2c-8c2a-aefc954aeaac'
  AND NOT (COALESCE(raw_app_meta_data->'tenants', '[]'::jsonb) @> '"demo"'::jsonb);