-- ==========================================
-- 1. TIPOS ENUM (Estados y Servicios)
-- ==========================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status_enum') THEN
        CREATE TYPE order_status_enum AS ENUM ('abierta', 'en_prueba', 'finalizada', 'anulada');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_type_enum') THEN
        CREATE TYPE service_type_enum AS ENUM ('RTM', 'preventiva', 'peritaje', 'otro');
    END IF;
END $$;




-- ==========================================
-- 1. TIPOS ENUM (Definición de respuestas)
-- ==========================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'condition_response_enum') THEN
        CREATE TYPE condition_response_enum AS ENUM ('cumple', 'no_cumple', 'no_aplica');
    END IF;
END $$;

-- ==========================================
-- 1. TIPOS ENUM (Definiciones previas)
-- ==========================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_type_enum') THEN
        CREATE TYPE vehicle_type_enum AS ENUM ('liviano', 'pesado', 'motocicleta_4t', 'motocicleta_2t', 'motocicleta_electrica', 'motocarro_4t', 'motocarro_2t', 'motocarro_diesel');
    END IF;
END $$;



-- Enums de los roles del sistema
CREATE TYPE public.user_role_enum AS ENUM (
            'gerente',
            'recepcionista',
            'aux_administrativo',
            'director_tecnico'
        );
        
        -- Añadimos un comentario a la base de datos para documentar el tipo
COMMENT ON TYPE public.user_role_enum IS 'Roles asignados a los usuarios dentro del CDA para control de accesos (SGC / ISO 17020).';



CREATE TYPE public.office_payment_type_enum AS ENUM (
  'efectivo', 
  'tarjeta_debito', 
  'tarjeta_credito', 
  'sistecredito', 
  'addi', 
  'transferencia', 
  'qr'
);

COMMENT ON TYPE public.office_payment_type_enum IS 
'Métodos de pago autorizados para la facturación de servicios en la caja de la oficina del CDA.
Valores permitidos:
  - efectivo: Pago con moneda corriente física.
  - tarjeta_debito: Tarjeta de débito bancaria (Mister, Visa, etc.).
  - tarjeta_credito: Tarjeta de crédito (Franquicias tradicionales).
  - sistecredito: Línea de crédito y financiamiento por plataforma Sistecrédito.
  - addi: Compra a cuotas mediante la pasarela fintech Addi.
  - transferencia: Transferencias directas verificadas (Bancolombia, Nequi, Daviplata, etc.).
  - qr: Pagos mediante códigos QR de interoperabilidad bancaria.
Este tipo es crítico para los cierres, arqueos de caja diarios y auditorías contables.';






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