-- 1. Eliminamos la función anterior para evitar conflictos de firmas
DROP FUNCTION IF EXISTS public.get_service_users_with_tenant(uuid);

-- 2. Creamos la versión optimizada con ORDER BY
CREATE OR REPLACE FUNCTION public.get_service_users_with_tenant(target_tenant_id uuid)
RETURNS SETOF public.service_users
SET search_path = public
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecuta con privilegios elevados para saltar RLS interno si es necesario
AS $$
BEGIN
  -- Verificación de seguridad: ¿El usuario que consulta pertenece a este tenant?
  IF NOT EXISTS (
    SELECT 1
    FROM public.tenant_permissions tp
    JOIN public.service_users su ON tp.service_user_id = su.id
    WHERE tp.tenant_id = target_tenant_id
    AND su.auth_user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Acceso denegado: no tienes permisos en este tenant.';
  END IF;

  -- Retorno de los usuarios ordenados alfabéticamente
  RETURN QUERY
  SELECT su.*
  FROM public.service_users su
  INNER JOIN public.tenant_permissions tp ON su.id = tp.service_user_id
  WHERE tp.tenant_id = target_tenant_id
  ORDER BY su.full_name ASC; -- <--- Garantiza que no salten al actualizar
END;
$$;