-- ============================================================
-- INMUTABILIDAD (trigger BEFORE UPDATE)
-- Los snapshots no se modifican después de creados.
-- Se permite DELETE para que el CASCADE de entry_orders funcione.
-- ============================================================

CREATE OR REPLACE FUNCTION public.prevent_price_snapshot_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION
        'Los snapshots de precio son inmutables. Operación UPDATE bloqueada en %.',
        TG_TABLE_NAME;
END;

$$;