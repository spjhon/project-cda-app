/*
      ===================================================================================
      PROPÓSITO:
      Retorna la lista de UUIDs de los Tenants (CDAs) a los que el usuario autenticado actual 
      (auth.uid) tiene acceso permitido según la tabla de asignación de permisos.

      ¿POR QUÉ EXISTE ESTA FUNCIÓN Y NO HACEMOS EL JOIN DIRECTO EN EL RLS?:
      Por RENDIMIENTO. Si pones un "JOIN" o un "IN (SELECT ...)" con JOINs directamente 
      en la política RLS, Postgres ejecutará esa consulta por cada maldita fila que intente 
      leer (ej: si consultas 500 vehículos, hace 500 JOINs).
      
      Al marcar esta función como STABLE, Postgres sabe que los tenants autorizados de un 
      usuario no van a cambiar en medio de una misma consulta física, por lo que ejecuta el 
      JOIN una sola vez al inicio, cachea los IDs de los tenants, y los evalúa al instante.
      ===================================================================================
    */


CREATE OR REPLACE FUNCTION public.get_my_tenants()
RETURNS SETOF uuid 
LANGUAGE sql
STABLE -- <- Esto es la magia del rendimiento, cachea el resultado en la consulta
SECURITY DEFINER -- Runs with high privilege to bypass RLS on tenant_permissions if necessary
SET search_path = public
AS $$
    SELECT tp.tenant_id 
    FROM public.tenant_permissions tp
    JOIN public.service_users su ON su.id = tp.service_user_id
    WHERE su.auth_user_id = auth.uid();
$$;

COMMENT ON FUNCTION public.get_my_tenants() IS 
'OPTIMIZACIÓN RLS (Multi-tenant): Retorna los tenant_ids del usuario actual. Marcada como STABLE para cachear resultados y evitar JOINs masivos fila por fila en políticas de seguridad.';