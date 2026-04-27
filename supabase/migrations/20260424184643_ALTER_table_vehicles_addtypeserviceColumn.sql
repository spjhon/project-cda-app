-- 1. Crear el nuevo tipo ENUM
CREATE TYPE public.vehicle_service_type_enum AS ENUM (
  'particular', 
  'enseñanza', 
  'oficial', 
  'publico', 
  'diplomático', 
  'especial'
);

-- 2. Agregar la columna a la tabla vehicles
ALTER TABLE public.vehicles 
ADD COLUMN tipo_servicio_vehiculo public.vehicle_service_type_enum NOT NULL DEFAULT 'particular';

-- 3. (Opcional) Crear un índice para mejorar búsquedas por tipo de servicio
CREATE INDEX IF NOT EXISTS vehicles_tipo_servicio_idx ON public.vehicles (tipo_servicio_vehiculo);

-- 4. Comentario para documentar el campo
COMMENT ON COLUMN public.vehicles.tipo_servicio_vehiculo IS 'Clasificación del servicio según la tarjeta de propiedad (Particular, Público, etc.)';