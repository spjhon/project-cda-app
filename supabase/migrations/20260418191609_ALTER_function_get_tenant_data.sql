-- 1. Eliminamos la función existente para poder cambiar su tipo de retorno
-- Nota: Usamos el tipo de argumento para identificarla correctamente
DROP FUNCTION IF EXISTS public.get_tenant_data(text);


CREATE OR REPLACE FUNCTION public.get_tenant_data(p_tenant_slug text)
RETURNS TABLE (
  id uuid,
  name text,
  domain text,
  logo_url text  -- 1. Agregamos la columna al retorno
) 
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT id, name, domain, logo_url
  FROM tenants
  WHERE domain = p_tenant_slug
  LIMIT 1;
$$;