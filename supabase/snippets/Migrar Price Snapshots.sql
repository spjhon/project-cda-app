BEGIN;

-- ============================================================
-- 1. BORRAR los snapshots migrados (si ya existían)
-- ============================================================
-- Borra solo los que tienen el nombre 'histórico' (los de esta
-- migración). No toca los snapshots "reales" de FullMotos.
DELETE FROM public.entry_order_price_snapshot
WHERE vehicle_service_rate_name LIKE '%histórico%'
  AND tenant_id = 'dddddddd-0000-0000-0000-000000000004';

-- (El ON DELETE CASCADE borra los fees hijos, pero como no hay fees, no pasa nada)


-- ============================================================
-- 2. RE-INSERTAR con created_at = eo.fecha
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
        created_at   -- 👈 NUEVO: created_at explícito = fecha de la orden
    )
    SELECT
        eo.tenant_id,
        eo.id,
        CASE
            WHEN eo.rate_price_snapshot = 0 THEN 'Gratis (histórico)'
            ELSE 'Reconstruido (histórico)'
        END,
        0,
        0,
        0,
        0,
        0,
        eo.rate_price_snapshot,
        0,
        eo.rate_price_snapshot,
        eo.fecha   -- 👈 created_at = fecha de la orden
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
-- 3. REFRESCAR la view
-- ============================================================
REFRESH MATERIALIZED VIEW public.mv_reportes_desglose_precio;


-- ============================================================
-- 4. VERIFICAR antes del COMMIT
-- ============================================================
-- ¿Los snapshots migrados tienen created_at = eo.fecha?
SELECT
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE ps.created_at = eo.fecha) AS cuadran_created_at,
    COUNT(*) FILTER (WHERE ps.created_at <> eo.fecha) AS no_cuadran
FROM public.entry_order_price_snapshot ps
JOIN public.entry_orders eo ON eo.id = ps.entry_order_id
WHERE ps.vehicle_service_rate_name LIKE '%histórico%'
  AND ps.tenant_id = 'dddddddd-0000-0000-0000-000000000004';

COMMIT;
-- ROLLBACK; -- si algo mal