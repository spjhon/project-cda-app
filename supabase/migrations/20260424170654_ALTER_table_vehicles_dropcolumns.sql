-- Eliminación de columnas de documentos de la tabla vehicles
ALTER TABLE public.vehicles 
DROP COLUMN IF EXISTS soat_vencimiento,
DROP COLUMN IF EXISTS gas_numero,
DROP COLUMN IF EXISTS gas_vencimiento;

-- Comentario para documentar el cambio en el esquema
COMMENT ON TABLE public.vehicles IS 'Tabla de vehículos. Los datos de SOAT y Gas se gestionan ahora directamente en entry_orders para mantener trazabilidad histórica.';