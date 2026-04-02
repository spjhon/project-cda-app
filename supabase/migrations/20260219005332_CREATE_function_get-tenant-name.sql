create or replace function public.get_tenant_name(p_tenant_slug text)
returns text
language sql
SET search_path = public
as $$
  select name
  from tenants
  where slug = p_tenant_slug
  limit 1;
$$