-- ==========================================================
-- ==========================================================
-- Migración: Actualizar tabla service_users
-- ==========================================================

-- 1. Agregar columnas nuevas
ALTER TABLE public.service_users 
ADD COLUMN IF NOT EXISTS is_available BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS job_title TEXT;

-- 2. Agregar comentarios
COMMENT ON COLUMN public.service_users.is_available IS 'Indica si el usuario está disponible (vacaciones, enfermedad, etc.)';
COMMENT ON COLUMN public.service_users.job_title IS 'Título profesional o cargo del usuario dentro del equipo';

-- 3. Crear índices para rendimiento
-- Índice para búsqueda de disponibilidad
CREATE INDEX IF NOT EXISTS service_users_is_available_idx ON public.service_users (is_available);

-- 4. Preparar búsqueda por texto (Búsqueda de nombre)
-- Habilitar extensión para coincidencias parciales (trigramas)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Índice GIN para búsquedas eficientes en full_name
CREATE INDEX IF NOT EXISTS service_users_full_name_trgm_idx 
ON public.service_users USING gin (full_name gin_trgm_ops);