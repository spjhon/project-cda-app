-- ==========================================================
-- Migración: Agregar campos de asignación a tickets
-- ==========================================================

-- 1. Agregar las columnas si no existen
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS assignee uuid REFERENCES public.service_users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS assignee_name text;

-- 2. Crear índice para el asignado (Optimización de consultas)
-- Es muy común filtrar tickets por "quién tiene asignado este ticket"
CREATE INDEX IF NOT EXISTS tickets_assignee_idx ON public.tickets (assignee);

-- 3. Comentarios para documentar los nuevos campos
COMMENT ON COLUMN public.tickets.assignee IS 'ID del usuario asignado al ticket (relacionado con service_users).';
COMMENT ON COLUMN public.tickets.assignee_name IS 'Nombre del usuario asignado (campo informativo para evitar joins constantes).';