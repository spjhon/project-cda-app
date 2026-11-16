-- Pagos (también depende de entry_orders)
DELETE FROM public.entry_order_payments
WHERE entry_order_id IN (
  SELECT id FROM public.entry_orders
  WHERE tenant_id = 'dddddddd-0000-0000-0000-000000000004'
    AND fecha >= '2026-11-01 00:00:00-05'
    AND fecha < '2026-12-01 00:00:00-05'
);

-- ============================================================
-- 2. BORRAR LAS ÓRDENES DE ENERO 2026
-- ============================================================
DELETE FROM public.entry_orders
WHERE tenant_id = 'dddddddd-0000-0000-0000-000000000004'
  AND fecha >= '2026-11-01 00:00:00-05'
  AND fecha < '2026-12-01 00:00:00-05';

-- ============================================================
-- 3. REFRESCAR VISTAS MATERIALIZADAS
-- ============================================================
REFRESH MATERIALIZED VIEW public.mv_reportes_diarios;
REFRESH MATERIALIZED VIEW public.mv_reportes_contables;