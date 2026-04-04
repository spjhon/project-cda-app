-- ==========================================
-- MIGRACIÓN: service_users v1.1 -> v1.2
-- ==========================================

-- 1. LIMPIEZA ABSOLUTA
-- Borramos el índice viejo primero para que no dé errores
DROP INDEX IF EXISTS service_users_is_available_idx;
-- Borramos la columna que ya no usaremos
ALTER TABLE public.service_users 
DROP COLUMN IF EXISTS is_available,
DROP COLUMN IF EXISTS job_title;

-- 2. ADICIÓN DE NUEVAS COLUMNAS
-- Nota: Primero las añadimos como NULL para no romper datos existentes
ALTER TABLE public.service_users 
ADD COLUMN IF NOT EXISTS document_type TEXT NOT NULL DEFAULT 'cedula',
ADD COLUMN IF NOT EXISTS document_number TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;


-- 4. APLICAR RESTRICCIÓN NOT NULL
ALTER TABLE public.service_users ALTER COLUMN document_number SET NOT NULL;

-- 5. Regla de tipos de documento
ALTER TABLE public.service_users
    ADD CONSTRAINT service_users_document_type_check 
    CHECK (document_type IN ('cedula', 'cedula_extrangeria', 'pasaporte', 'nit', 'targeta_identidad'));

-- UNICIDAD COMPUESTA (La clave para evitar duplicados reales)
ALTER TABLE public.service_users
    ADD CONSTRAINT service_users_document_unique 
    UNIQUE (document_type, document_number);

-- 6. ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS service_users_document_number_idx ON public.service_users (document_number);
CREATE INDEX IF NOT EXISTS service_users_is_active_idx ON public.service_users (is_active);

-- 7. COMENTARIOS
COMMENT ON COLUMN public.service_users.document_number IS 'Número de identificación legal (Obligatorio)';
COMMENT ON COLUMN public.service_users.is_active IS 'Control maestro de acceso al sistema';