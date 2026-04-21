-- Paso 1: Agregar la columna permitiendo nulos (para no romper los registros actuales)
ALTER TABLE tenants 
ADD COLUMN logo_url TEXT;

-- Paso 2: (Opcional) Si quieres que los registros actuales tengan un logo por defecto 
-- en lugar de NULL, ejecuta esto antes del paso 3:
-- UPDATE tenants SET logo_url = 'https://tu-url.com/placeholder.png' WHERE logo_url IS NULL;

-- Paso 3: Establecer el valor por defecto para los NUEVOS registros
ALTER TABLE tenants 
ALTER COLUMN logo_url SET DEFAULT 'https://pixabay.com/images/download/raphaelsilva-avatar-3814049_1920.png';

-- Paso 4: Obligar a que los registros FUTUROS no sean nulos
-- Nota: Para que esto funcione y los registros viejos sigan siendo NULL, 
-- no usamos NOT NULL (que valida a todos), sino un CHECK que solo aplique 
-- a los que se inserten o actualicen a partir de ahora.
ALTER TABLE tenants 
ADD CONSTRAINT logo_url_not_null_check 
CHECK (logo_url IS NOT NULL) NOT VALID;

-- El "NOT VALID" le dice a Postgres: "No revises los datos viejos, solo valida los nuevos".

-- 2. (Opcional) Agregar un comentario a la columna para documentación
COMMENT ON COLUMN tenants.logo_url IS 'URL pública del logo del taller almacenado en Supabase Storage';