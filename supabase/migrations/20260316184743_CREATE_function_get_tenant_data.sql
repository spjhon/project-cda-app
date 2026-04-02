CREATE OR REPLACE FUNCTION public.get_tenant_data(p_tenant_slug text)
RETURNS TABLE (
  id uuid,
  name text,
  domain text
) 
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT id, name, domain
  FROM tenants
  WHERE domain = p_tenant_slug
  LIMIT 1;
$$;