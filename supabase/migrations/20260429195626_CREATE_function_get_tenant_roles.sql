CREATE OR REPLACE FUNCTION public.get_tenant_roles(p_tenant_id uuid)
RETURNS text[] AS $$
DECLARE
  v_service_user_id uuid;
  v_roles_array text[];
BEGIN
  -- 1. Obtenemos el ID de nuestra tabla de negocio 'service_users' 
  -- usando el ID de autenticación del JWT (auth.uid())
  SELECT id INTO v_service_user_id 
  FROM public.service_users 
  WHERE auth_user_id = auth.uid();

  -- 2. Si no encontramos un usuario de servicio, retornamos un array vacío
  IF v_service_user_id IS NULL THEN
    RETURN ARRAY[]::text[];
  END IF;

  -- 3. Buscamos todos los roles asignados a ese usuario en ESE tenant específico
  SELECT array_agg(role) INTO v_roles_array
  FROM public.tenant_permissions
  WHERE service_user_id = v_service_user_id 
    AND tenant_id = p_tenant_id;

  -- 4. Retornamos el array (o un array vacío si no tiene permisos)
  RETURN COALESCE(v_roles_array, ARRAY[]::text[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;