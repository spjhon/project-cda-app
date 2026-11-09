-- ============================================================
-- MIGRACIÓN: Permitir monto_bruto igual a 0
-- ============================================================

-- 1. Eliminar la restricción antigua
ALTER TABLE public.entry_order_payments
DROP CONSTRAINT entry_order_payments_monto_bruto_check;

-- 2. Crear la nueva restricción que permita >= 0
ALTER TABLE public.entry_order_payments
ADD CONSTRAINT entry_order_payments_monto_bruto_check
CHECK (monto_bruto >= 0);