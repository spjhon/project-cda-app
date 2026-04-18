INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tenants-public', 
  'tenants-public', 
  true, -- Público para que los logos se vean en PDFs y correos fácilmente
  1048576, -- Límite de 1MB (sobra para un logo)
  ARRAY['image/jpeg', 'image/png', 'image/webp'] -- Formatos modernos
)
--El on conflict es por si se hace un cambio en el tamaño o mime type, no haya que borrar el bucket sino solo cambiar los datos y correr la migracion
ON CONFLICT (id) DO UPDATE 
SET 
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Política: Permitir que solo administradores (authenticated) suban/borren logos
-- Nota: La lectura es automática porque el bucket es public: true
CREATE POLICY "Admins can upload logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'tenants-public'
);

CREATE POLICY "Admins can update or delete logos"
ON storage.objects
FOR ALL -- Cubre UPDATE y DELETE
TO authenticated
USING (
  bucket_id = 'tenants-public'
);