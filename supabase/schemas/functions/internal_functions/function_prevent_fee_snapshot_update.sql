



-- ============================================================
-- INMUTABILIDAD (trigger BEFORE UPDATE)
-- Los snapshots de fee no se modifican después de creados.
-- Se permite DELETE para que el CASCADE de la cabecera funcione.
-- ============================================================

CREATE OR REPLACE FUNCTION public.prevent_fee_snapshot_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION
        'Los snapshots de fee son inmutables. Operación UPDATE bloqueada en %.',
        TG_TABLE_NAME;
END;
$$;

