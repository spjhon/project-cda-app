-- ============================================================
-- ENUM: TIPO DE COMBUSTIBLE DEL VEHÍCULO
-- ============================================================
-- Valores correspondientes a los códigos internos utilizados
-- por la aplicación en FUEL_OPTIONS.
-- ============================================================

CREATE TYPE public.fuel_type_enum AS ENUM (
    'gasolina',
    'gas_natural_vehicular',
    'diesel',
    'gas_gasolina',
    'hibrido',
    'electrico',
    'etanol',
    'biodiesel',
    'hidrogeno'
);

-- ============================================================
-- COMENTARIO DEL ENUM
-- ============================================================

COMMENT ON TYPE public.fuel_type_enum IS
'Enum que define los tipos de combustible utilizados para la configuración de tarifas y la clasificación de vehículos.';