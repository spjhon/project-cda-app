-- ============================================================
-- ENUM: TIPO DE CLASE DEL VEHÍCULO
-- ============================================================
-- Valores correspondientes a los códigos internos utilizados
-- por la aplicación en CLASE_OPTIONS.
-- ============================================================

CREATE TYPE public.vehicle_class_enum AS ENUM (
    'automovil',
    'bus',
    'buseta',
    'camion',
    'camioneta',
    'campero',
    'microbus',
    'tractocamion',
    'motocicleta',
    'motocarro',
    'mototriciclo',
    'cuatrimoto',
    'remolque',
    'semiremolque',
    'volqueta',
    'sin_clase',
    'maquinaria_construccion_o_minera',
    'ciclomotor',
    'tricimoto',
    'cuadriciclo'
);

-- ============================================================
-- COMENTARIO DEL ENUM
-- ============================================================

COMMENT ON TYPE public.vehicle_class_enum IS
'Enum que define las clases de vehículos utilizadas para la configuración de tarifas y la clasificación de vehículos.';