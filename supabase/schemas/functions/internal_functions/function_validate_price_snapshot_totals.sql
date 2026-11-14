-- ============================================================
-- VALIDACIÓN DE CUADRE (trigger BEFORE INSERT)
-- Garantiza que los totales sean coherentes entre sí y que
-- coincidan con entry_orders.rate_price_snapshot si viene informado.
-- ============================================================

CREATE OR REPLACE FUNCTION public.validate_price_snapshot_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_rate_price NUMERIC(12,2);
BEGIN
    -- ---------------------------------------------------------
    -- 1. Cuadre interno del snapshot
    -- ---------------------------------------------------------
    IF NEW.subtotal <> (NEW.base_price + NEW.fees_subtotal) THEN
        RAISE EXCEPTION
            'Snapshot incoherente: subtotal (%) ≠ base_price (%) + fees_subtotal (%)',
            NEW.subtotal, NEW.base_price, NEW.fees_subtotal;
    END IF;

    IF NEW.iva_total <> (NEW.base_price_iva_amount + NEW.fees_iva_total) THEN
        RAISE EXCEPTION
            'Snapshot incoherente: iva_total (%) ≠ base_price_iva_amount (%) + fees_iva_total (%)',
            NEW.iva_total, NEW.base_price_iva_amount, NEW.fees_iva_total;
    END IF;

    IF NEW.total <> (NEW.subtotal + NEW.iva_total) THEN
        RAISE EXCEPTION
            'Snapshot incoherente: total (%) ≠ subtotal (%) + iva_total (%)',
            NEW.total, NEW.subtotal, NEW.iva_total;
    END IF;

    -- ---------------------------------------------------------
    -- 2. Coherencia con entry_orders.rate_price_snapshot
    --    (solo si el padre trae un valor no nulo)
    -- ---------------------------------------------------------
    SELECT rate_price_snapshot
      INTO v_rate_price
      FROM public.entry_orders
     WHERE id = NEW.entry_order_id;

    IF v_rate_price IS NOT NULL AND v_rate_price <> NEW.total THEN
        RAISE EXCEPTION
            'Snapshot incoherente: total (%) ≠ entry_orders.rate_price_snapshot (%)',
            NEW.total, v_rate_price;
    END IF;

    RETURN NEW;
END;
$$;