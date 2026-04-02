create or replace function public.set_created_by_table_tickets()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- Buscamos al usuario interno basándonos en la sesión de Supabase
  -- Aqui lo que se esta diciendo es seleccionar el id que resulta del from e 
  -- inyectarlo en el field created_by que es a donde esta dirigida la info que atrapa el trigger
  SELECT id INTO NEW.created_by
  FROM public.service_users
  WHERE auth_user_id = auth.uid();
  -- Opcional: Si el usuario no existe en service_users, bloqueamos el insert
  IF NEW.created_by IS NULL THEN
    RAISE EXCEPTION 'No se encontró un perfil de servicio para el usuario actual.';
  END IF;
  RETURN NEW;
end;
$$;