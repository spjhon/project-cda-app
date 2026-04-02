-- 1. Asegúrate de que la tabla esté en la publicación de realtime
-- Si ya existe la publicación, simplemente añade la tabla
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;

-- 2. (Opcional) Si quieres escuchar solo eventos específicos (INSERT, UPDATE, DELETE)
-- Por defecto añade todos, pero puedes ser selectivo:
-- ALTER PUBLICATION supabase_realtime SET TABLE public.comments;