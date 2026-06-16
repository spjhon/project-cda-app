

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