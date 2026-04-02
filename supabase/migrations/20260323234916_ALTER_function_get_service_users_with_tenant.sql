-- 1. Eliminamos la versión anterior (especificando los argumentos para evitar conflictos)
DROP FUNCTION IF EXISTS public.get_service_users_with_tenant(uuid);

-- 2. Creamos la nueva versión sin la validación interna de auth.uid()
CREATE OR REPLACE FUNCTION public.get_service_users_with_tenant(target_tenant_id uuid)
RETURNS SETOF public.service_users
SET search_path = public
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecuta con privilegios de sistema, ideal para el Admin Client
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT su.*
  FROM public.service_users su
  JOIN public.tenant_permissions tp ON su.id = tp.service_user_id
  WHERE tp.tenant_id = target_tenant_id
  ORDER BY su.full_name ASC;
END;
$$;