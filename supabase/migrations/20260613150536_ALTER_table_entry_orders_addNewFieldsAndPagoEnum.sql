-- =========================================================================
-- 1. CREACIÓN DEL ENUM PARA TIPOS DE PAGO EN LA OFICINA
-- =========================================================================
CREATE TYPE public.office_payment_type_enum AS ENUM (
  'efectivo', 
  'tarjeta_debito', 
  'tarjeta_credito', 
  'sistecredito', 
  'addi', 
  'transferencia', 
  'qr'
);

-- =========================================================================
-- 2. ALTERACIÓN DE LA TABLA ENTRY_ORDERS PARA AGREGAR NUEVOS CAMPOS
-- =========================================================================
ALTER TABLE public.entry_orders
  -- Datos financieros y de control de la oficina
  ADD COLUMN oficina_pin character varying NULL,
  ADD COLUMN oficina_pago numeric(12,2) NULL DEFAULT 0.00,
  ADD COLUMN oficina_consecutivo_factura character varying NULL,
  ADD COLUMN oficina_tipo_pago public.office_payment_type_enum NULL,

  -- Datos obligatorios del RUNT y procesos internos del CDA
  ADD COLUMN oficina_fupas character varying NULL,
  ADD COLUMN oficina_certificados_runt character varying NULL,

  -- Control y adicionales comerciales
  ADD COLUMN se_compro_soat boolean NOT NULL DEFAULT false,
  ADD COLUMN resultado_revision text NULL;

-- =========================================================================
-- 3. OPTIMIZACIÓN: ÍNDICES COMPUESTOS PARA MULTI-TENANCY
-- =========================================================================
-- Índice para búsquedas por factura (Cuadres de caja, reportes de ingresos)
CREATE INDEX IF NOT EXISTS entry_orders_oficina_factura_tenant_idx 
ON public.entry_orders USING btree (tenant_id, oficina_consecutivo_factura) 
TABLESPACE pg_default;

-- Índice para auditorías u operaciones por número de FUPAS
CREATE INDEX IF NOT EXISTS entry_orders_oficina_fupas_idx 
ON public.entry_orders USING btree (tenant_id, oficina_fupas) 
TABLESPACE pg_default;

-- Índice para auditorías de la ONAC o búsquedas por certificado RUNT
CREATE INDEX IF NOT EXISTS entry_orders_oficina_certificados_runt_idx 
ON public.entry_orders USING btree (tenant_id, oficina_certificados_runt) 
TABLESPACE pg_default;

-- =========================================================================
-- 4. COMENTARIOS
-- =========================================================================

COMMENT ON COLUMN public.entry_orders.oficina_tipo_pago IS 
'Registra la modalidad de pago con la que el cliente canceló la Revisión Técnico-Mecánica (RTM) u otros servicios. Vinculado al enum office_payment_type_enum.';

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