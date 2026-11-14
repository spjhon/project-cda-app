-- ============================================================
-- POLICIES FALTANTES: INSERT y DELETE
-- ============================================================
-- Las tablas entry_order_price_snapshot y entry_order_fee_snapshot
-- ya tienen policy de SELECT. Faltan INSERT y DELETE para que la
-- RPC update_office_order_data pueda insertar y borrar snapshots.
--
-- Nota: NO se agrega policy de UPDATE. Los snapshots son inmutables
-- (trigger BEFORE UPDATE ya bloquea cualquier modificación).
-- Sin policy de UPDATE → queda denegado por defecto. ✅
-- ============================================================


-- ============================================================
-- 1. entry_order_price_snapshot (cabecera)
-- ============================================================

-- ------------------------------------------------------------
-- 1.1 INSERT: solo cabeceras de tenants del usuario
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "insert_price_snapshot_by_tenant"
    ON public.entry_order_price_snapshot;

CREATE POLICY "insert_price_snapshot_by_tenant"
    ON public.entry_order_price_snapshot
    FOR INSERT
    TO authenticated
    WITH CHECK (
        tenant_id IN (SELECT public.get_my_tenants())
    );


-- ------------------------------------------------------------
-- 1.2 DELETE: solo cabeceras de tenants del usuario
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "delete_price_snapshot_by_tenant"
    ON public.entry_order_price_snapshot;

CREATE POLICY "delete_price_snapshot_by_tenant"
    ON public.entry_order_price_snapshot
    FOR DELETE
    TO authenticated
    USING (
        tenant_id IN (SELECT public.get_my_tenants())
    );


-- ============================================================
-- 2. entry_order_fee_snapshot (detalle)
-- ============================================================

-- ------------------------------------------------------------
-- 2.1 INSERT: solo fees de tenants del usuario
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "insert_fee_snapshot_by_tenant"
    ON public.entry_order_fee_snapshot;

CREATE POLICY "insert_fee_snapshot_by_tenant"
    ON public.entry_order_fee_snapshot
    FOR INSERT
    TO authenticated
    WITH CHECK (
        tenant_id IN (SELECT public.get_my_tenants())
    );


-- ------------------------------------------------------------
-- 2.2 DELETE: solo fees de tenants del usuario
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "delete_fee_snapshot_by_tenant"
    ON public.entry_order_fee_snapshot;

CREATE POLICY "delete_fee_snapshot_by_tenant"
    ON public.entry_order_fee_snapshot
    FOR DELETE
    TO authenticated
    USING (
        tenant_id IN (SELECT public.get_my_tenants())
    );