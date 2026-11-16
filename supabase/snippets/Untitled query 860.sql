BEGIN;

-- ============================================================
-- 1. DESACTIVAR el trigger de validación
-- ============================================================
ALTER TABLE public.entry_order_price_snapshot
    DISABLE TRIGGER tr_validate_price_snapshot_totals;

-- ============================================================
-- 2. BORRAR snapshots migrados previos (si existen)
-- ============================================================
DELETE FROM public.entry_order_price_snapshot
WHERE vehicle_service_rate_name LIKE '%histórico%'
  AND tenant_id = 'dddddddd-0000-0000-0000-000000000004';

-- ============================================================
-- 3. INSERTAR solo el total, resto en 0
-- ============================================================
WITH inserted AS (
    INSERT INTO public.entry_order_price_snapshot (
        tenant_id,
        entry_order_id,
        vehicle_service_rate_name,
        base_price,
        base_price_iva_percentage,
        base_price_iva_amount,
        fees_subtotal,
        fees_iva_total,
        subtotal,
        iva_total,
        total,
        created_at
    )
    SELECT
        eo.tenant_id,
        eo.id,
        CASE
            WHEN eo.rate_price_snapshot = 0 THEN 'Gratis (histórico)'
            ELSE 'Reconstruido (histórico)'
        END,
        0,                         -- base_price = 0
        0,                         -- base_iva_percentage = 0
        0,                         -- base_iva_amount = 0
        0,                         -- fees_subtotal = 0
        0,                         -- fees_iva_total = 0
        0,                         -- subtotal = 0
        0,                         -- iva_total = 0
        eo.rate_price_snapshot,   -- total = rate_price_snapshot
        eo.fecha                   -- created_at = fecha de la orden
    FROM public.entry_orders eo
    WHERE eo.tenant_id = 'dddddddd-0000-0000-0000-000000000004'
      AND eo.deleted_at IS NULL
      AND eo.estado_orden = 'finalizada'
      AND COALESCE(eo.es_reinspeccion, false) = false
      AND eo.rate_price_snapshot >= 0
      AND NOT EXISTS (
          SELECT 1 FROM public.entry_order_price_snapshot ps
          WHERE ps.entry_order_id = eo.id
      )
    RETURNING total
)
SELECT
    COUNT(*) FILTER (WHERE total > 0) AS con_precio,
    COUNT(*) FILTER (WHERE total = 0)  AS gratis,
    COUNT(*) AS total_insertados
FROM inserted;

-- ============================================================
-- 4. REACTIVAR el trigger
-- ============================================================
ALTER TABLE public.entry_order_price_snapshot
    ENABLE TRIGGER tr_validate_price_snapshot_totals;

-- ============================================================
-- 5. REFRESCAR la view
-- ============================================================
REFRESH MATERIALIZED VIEW public.mv_reportes_desglose_precio;

-- ============================================================
-- 6. VERIFICAR antes del COMMIT
-- ============================================================
-- ¿Los snapshots migrados tienen el total correcto?
SELECT
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE ps.total = eo.rate_price_snapshot) AS cuadran_total,
    COUNT(*) FILTER (WHERE ps.created_at = eo.fecha) AS cuadran_created_at,
    SUM(ps.total) AS suma_total,
    SUM(ps.base_price) AS suma_base,
    SUM(ps.iva_total) AS suma_iva
FROM public.entry_order_price_snapshot ps
JOIN public.entry_orders eo ON eo.id = ps.entry_order_id
WHERE ps.vehicle_service_rate_name LIKE '%histórico%'
  AND ps.tenant_id = 'dddddddd-0000-0000-0000-000000000004';

COMMIT;
-- ROLLBACK; -- si algo mal