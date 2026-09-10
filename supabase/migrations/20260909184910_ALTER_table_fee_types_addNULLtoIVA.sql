-- ============================================================
-- MIGRACIÓN: IVA NULLABLE EN FEE_TYPES
-- ============================================================

ALTER TABLE public.fee_types
ALTER COLUMN iva_percentage DROP NOT NULL;

ALTER TABLE public.fee_types
ALTER COLUMN iva_percentage DROP DEFAULT;