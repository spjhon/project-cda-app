-- ==========================================
-- SNAPSHOT DEL VEHÍCULO
-- ==========================================

ALTER TABLE public.entry_orders

ADD COLUMN vehiculo_placa_snapshot VARCHAR NOT NULL,
ADD COLUMN vehiculo_marca_snapshot VARCHAR NOT NULL,
ADD COLUMN vehiculo_linea_snapshot VARCHAR NOT NULL,
ADD COLUMN vehiculo_modelo_snapshot INTEGER NOT NULL,
ADD COLUMN vehiculo_color_snapshot VARCHAR NOT NULL,
ADD COLUMN vehiculo_tipo_snapshot public.vehicle_type_enum NOT NULL,
ADD COLUMN vehiculo_clase_snapshot VARCHAR NOT NULL,
ADD COLUMN vehiculo_combustible_snapshot VARCHAR NOT NULL,
ADD COLUMN vehiculo_cilindrada_snapshot INTEGER NOT NULL,
ADD COLUMN vehiculo_blindaje_snapshot BOOLEAN NOT NULL,
ADD COLUMN vehiculo_capacidad_pasajeros_snapshot INTEGER NOT NULL,
ADD COLUMN vehiculo_es_ensenanza_snapshot BOOLEAN NOT NULL,
ADD COLUMN vehiculo_tipo_servicio_snapshot public.vehicle_service_type_enum NOT NULL,
ADD COLUMN vehiculo_es_extranjero_snapshot BOOLEAN NOT NULL;



-- ==========================================
-- SNAPSHOT DEL PROPIETARIO
-- ==========================================

ALTER TABLE public.entry_orders

ADD COLUMN propietario_tipo_documento_snapshot TEXT NOT NULL,
ADD COLUMN propietario_numero_documento_snapshot VARCHAR NOT NULL,
ADD COLUMN propietario_nombre_snapshot TEXT NOT NULL,

ADD COLUMN propietario_telefono_snapshot VARCHAR,
ADD COLUMN propietario_email_snapshot TEXT,
ADD COLUMN propietario_direccion_snapshot TEXT;


-- ==========================================
-- SNAPSHOT DEL CLIENTE
-- ==========================================

ALTER TABLE public.entry_orders

ADD COLUMN cliente_tipo_documento_snapshot TEXT NOT NULL,
ADD COLUMN cliente_numero_documento_snapshot VARCHAR NOT NULL,
ADD COLUMN cliente_nombre_snapshot TEXT NOT NULL,

ADD COLUMN cliente_telefono_snapshot VARCHAR,
ADD COLUMN cliente_email_snapshot TEXT,
ADD COLUMN cliente_direccion_snapshot TEXT;


-- ==========================================
-- SNAPSHOT DEL FUNCIONARIO
-- ==========================================

ALTER TABLE public.entry_orders

ADD COLUMN funcionario_tipo_documento_snapshot TEXT NOT NULL,
ADD COLUMN funcionario_numero_documento_snapshot VARCHAR NOT NULL,
ADD COLUMN funcionario_nombre_snapshot TEXT NOT NULL,
ADD COLUMN funcionario_firma_base64_snapshot TEXT NOT NULL;