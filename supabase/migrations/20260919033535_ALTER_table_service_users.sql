ALTER TABLE public.service_users
ADD COLUMN signature_path text NULL;

COMMENT ON COLUMN public.service_users.signature_path IS
'Ruta de la firma del usuario almacenada en el bucket privado de Supabase Storage.';