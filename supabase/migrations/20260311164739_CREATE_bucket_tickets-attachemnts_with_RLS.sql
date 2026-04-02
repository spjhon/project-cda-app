INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tickets-attachments', 
  'tickets-attachments', 
  false, 
  5242880, -- Límite de 5MB en bytes
  ARRAY['image/jpeg', 'image/png', 'application/pdf'] -- Tipos permitidos
)
ON CONFLICT (id) DO UPDATE 
SET 
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Crear política para permitir que usuarios autenticados suban archivos
create policy "Authenticated users can upload files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'tickets-attachments'
  and (auth.uid() is not null) -- Validación básica
);

-- 3. Crear política para que solo el propietario pueda leer su archivo
create policy "Users can read their own files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'tickets-attachments'
  and auth.uid() = owner
);