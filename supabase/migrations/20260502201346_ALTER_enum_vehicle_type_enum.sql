-- 1. Renombrar el ENUM actual (el que tiene los valores que no quieres)
ALTER TYPE public.vehicle_type_enum RENAME TO vehicle_type_enum_old;

-- 2. Crear el ENUM nuevo con la lista perfecta
CREATE TYPE public.vehicle_type_enum AS ENUM (
  'liviano', 
  'pesado', 
  'motocicleta_4t', 
  'motocicleta_2t', 
  'motocarro_4t', 
  'motocarro_2t'
);

-- 3. Actualizar la tabla Vehicles para que use el NUEVO tipo
-- El "USING" es la clave: convierte el valor viejo a texto y luego al nuevo enum
ALTER TABLE public.vehicles 
  ALTER COLUMN tipo_vehiculo TYPE public.vehicle_type_enum 
  USING tipo_vehiculo::text::public.vehicle_type_enum;

-- 4. Ahora que la tabla Vehicles ya no usa el viejo, puedes borrarlo
DROP TYPE public.vehicle_type_enum_old;