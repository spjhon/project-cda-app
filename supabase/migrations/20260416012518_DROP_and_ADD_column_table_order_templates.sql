-- 1. Eliminar la columna antigua
ALTER TABLE public.order_template 
DROP COLUMN IF EXISTS applies_to_vehicle;

-- 3. Agregar la nueva columna de tipo de servicio
ALTER TABLE public.order_template 
ADD COLUMN service_type service_type_enum NOT NULL DEFAULT 'RTM';

-- 4. Documentar la columna para claridad del equipo
COMMENT ON COLUMN public.order_template.service_type IS 'Define si la plantilla es para RTM oficial, Preventiva o Peritaje comercial.';

-- 5. Crear un índice para búsquedas rápidas (útil cuando filtres plantillas en el dashboard)
CREATE INDEX IF NOT EXISTS order_templates_service_type_idx 
ON public.order_template (service_type);