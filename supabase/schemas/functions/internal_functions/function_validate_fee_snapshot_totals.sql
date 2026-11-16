CREATE OR REPLACE FUNCTION public.validate_fee_snapshot_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_iva_calculado NUMERIC(12,2);
BEGIN
    -- ---------------------------------------------------------
    -- 1. El IVA debe coincidir con ROUND(fee_amount * iva% / 100)
    --    redondeado al peso (igual que Math.round del frontend).
    -- ---------------------------------------------------------
    v_iva_calculado := ROUND(NEW.fee_amount * NEW.iva_percentage / 100);

    IF NEW.iva_amount <> v_iva_calculado THEN
        RAISE EXCEPTION
            'Snapshot de fee incoherente: iva_amount (%) ≠ ROUND(fee_amount (%) * iva_percentage (%) / 100) = %',
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