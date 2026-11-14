
-- ============================================================
-- VALIDACIÓN DE CUADRE (trigger BEFORE INSERT)
-- Garantiza que fee_total = fee_amount + iva_amount y que
-- iva_amount coincida con fee_amount * iva_percentage / 100.
-- ============================================================

CREATE OR REPLACE FUNCTION public.validate_fee_snapshot_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_iva_calculado NUMERIC(12,2);
BEGIN
    -- ---------------------------------------------------------
    -- 1. El IVA debe coincidir con fee_amount * iva_percentage / 100
    --    (con redondeo a 2 decimales, igual que la columna).
    -- ---------------------------------------------------------
    v_iva_calculado := ROUND(NEW.fee_amount * NEW.iva_percentage / 100, 2);

    IF NEW.iva_amount <> v_iva_calculado THEN
        RAISE EXCEPTION
            'Snapshot de fee incoherente: iva_amount (%) ≠ fee_amount (%) * iva_percentage (%) / 100 = %',
            NEW.iva_amount, NEW.fee_amount, NEW.iva_percentage, v_iva_calculado;
    END IF;

    -- ---------------------------------------------------------
    -- 2. El total debe ser fee_amount + iva_amount.
    -- ---------------------------------------------------------
    IF NEW.fee_total <> (NEW.fee_amount + NEW.iva_amount) THEN
        RAISE EXCEPTION
            'Snapshot de fee incoherente: fee_total (%) ≠ fee_amount (%) + iva_amount (%)',
            NEW.fee_total, NEW.fee_amount, NEW.iva_amount;
    END IF;

    RETURN NEW;
END;
$$;