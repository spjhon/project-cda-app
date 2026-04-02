-- Función que borra sesiones antiguas
create or replace function public.handle_single_session()
returns trigger as $$
begin
  -- Borramos todas las sesiones del usuario EXCEPTO la que se acaba de crear
  delete from auth.sessions
  where user_id = new.user_id
    and id != new.id;
  return new;
end;
$$ language plpgsql security definer;