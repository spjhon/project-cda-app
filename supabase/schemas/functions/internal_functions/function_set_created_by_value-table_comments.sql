create or replace function public.set_created_by_value()
returns trigger
language plpgsql
SECURITY DEFINER
set search_path = public
as $$
begin
  -- Buscamos el ID en service_users que coincide con el auth.uid() de la sesión
  SELECT id INTO NEW.created_by
  FROM public.service_users
  WHERE auth_user_id = auth.uid();

  -- Si no encontramos el usuario, abortamos la inserción
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No se pudo vincular el usuario actual con un registro en service_users';
  END IF;

  RETURN NEW;
end;
$$;