-- ============================================================
-- AGREGAR INFORMACIÓN SARLAFT A PERSONAS
-- ============================================================

ALTER TABLE public.personas
ADD COLUMN IF NOT EXISTS actividad_economica TEXT NULL,
ADD COLUMN IF NOT EXISTS origen_fondos TEXT NULL,
ADD COLUMN IF NOT EXISTS es_persona_publicamente_expuesta BOOLEAN NULL;