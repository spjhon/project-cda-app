-- Aplicamos el trigger a la tabla de sesiones de Supabase Auth
create trigger on_auth_session_created
  after insert on auth.sessions
  for each row execute procedure public.handle_single_session();


  //TRIGGER ELIMINADO EL 5 DE AGOSTO DE 2026