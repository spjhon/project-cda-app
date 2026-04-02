create or replace function public.get_tenant_domain(p_tenant_slug text)
returns text
language sql
SET search_path = public
as $$
  select domain
  from tenants
  where domain = p_tenant_slug
  limit 1;
$$