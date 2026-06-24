-- Migración: Adicionar campos de snapshot del funcionario a entry_orders
ALTER TABLE entry_orders 
ADD COLUMN IF NOT EXISTS funcionario_tipo_documento_snapshot TEXT,
ADD COLUMN IF NOT EXISTS funcionario_numero_documento_snapshot VARCHAR,
ADD COLUMN IF NOT EXISTS funcionario_nombre_snapshot TEXT,
ADD COLUMN IF NOT EXISTS funcionario_firma_base64_snapshot TEXT;

-- Comentarios de documentación para auditoría ISO 17020
COMMENT ON COLUMN entry_orders.funcionario_tipo_documento_snapshot IS 'Snapshot del tipo de documento del funcionario que firma.';
COMMENT ON COLUMN entry_orders.funcionario_numero_documento_snapshot IS 'Snapshot del número de documento del funcionario que firma.';
COMMENT ON COLUMN entry_orders.funcionario_nombre_snapshot IS 'Snapshot del nombre completo del funcionario que firma.';
COMMENT ON COLUMN entry_orders.funcionario_firma_base64_snapshot IS 'Snapshot en Base64 de la firma digitalizada del funcionario.';