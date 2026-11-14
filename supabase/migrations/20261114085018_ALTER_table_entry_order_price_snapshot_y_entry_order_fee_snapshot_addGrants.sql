-- ============================================================
-- GRANTS para las 2 tablas de snapshot
-- ============================================================

-- 1. Cabecera
GRANT SELECT, INSERT, DELETE
    ON public.entry_order_price_snapshot TO authenticated;

-- 2. Detalle
GRANT SELECT, INSERT, DELETE
    ON public.entry_order_fee_snapshot TO authenticated;

-- 3. (Opcional) Si usas service_role desde backend
GRANT SELECT, INSERT, DELETE
    ON public.entry_order_price_snapshot TO service_role;

GRANT SELECT, INSERT, DELETE
    ON public.entry_order_fee_snapshot TO service_role;