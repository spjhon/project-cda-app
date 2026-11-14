-- ============================================================
-- TABLA: entry_order_price_snapshot
-- Propósito:
--   Snapshot inmutable del precio de una orden de entrada.
--   Congela el nombre del rate, su base, su IVA y los totales
--   agregados (base + fees + IVA) en el momento exacto en que
--   se crea la orden.
--
--   Desacoplada totalmente de vehicle_service_rate: si mañana
--   cambias o borras el rate, este snapshot NO se entera.
--
--   Los datos del vehículo, cliente, funcionario y empresa NO
--   se duplican aquí: viven en entry_orders.
-- ============================================================

CREATE TABLE public.entry_order_price_snapshot (
    -- ========================================================
    -- 1. IDENTIFICACIÓN
    -- ========================================================
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tenant dueño del snapshot (denormalizado para RLS e índices).
    tenant_id                   UUID NOT NULL,

    -- Orden de entrada a la que pertenece este snapshot (relación 1:1).
    entry_order_id              UUID NOT NULL,

    -- ========================================================
    -- 2. CONTEXTO DEL RATE (texto congelado, sin FK)
    -- ========================================================
    -- Nombre del rate al momento de la orden. Se guarda como texto
    -- porque el rate puede renombrarse o borrarse después y queremos
    -- que el snapshot siga siendo legible.
    vehicle_service_rate_name   TEXT NOT NULL,

    -- ========================================================
    -- 3. MONTOS CONGELADOS DEL RATE (base)
    -- ========================================================
    base_price                  NUMERIC(12,2) NOT NULL,
    base_price_iva_percentage   NUMERIC(5,2)  NOT NULL DEFAULT 0,
    base_price_iva_amount       NUMERIC(12,2) NOT NULL DEFAULT 0,

    -- ========================================================
    -- 4. TOTALES AGREGADOS (incluyen fees)
    -- ========================================================
       -- Suma de los fee_amount (sin IVA) de todos los fees aplicados a la orden.
    -- Ej: si hay dos fees de 50.000 y 20.000 → fees_subtotal = 70.000.
    fees_subtotal               NUMERIC(12,2) NOT NULL DEFAULT 0,

    -- Suma del IVA de todos los fees aplicados.
    -- Se calcula fee por fee: cada fee aporta (fee_amount * fee_iva% / 100)
    -- y aquí se guarda el total de esos IVA sumados.
    fees_iva_total              NUMERIC(12,2) NOT NULL DEFAULT 0,

    -- Subtotal de la orden SIN IVA.
    -- Fórmula: subtotal = base_price + fees_subtotal
    -- (lo que costaría el servicio sin impuestos).
    subtotal                    NUMERIC(12,2) NOT NULL DEFAULT 0,

    -- IVA total de la orden.
    -- Fórmula: iva_total = base_price_iva_amount + fees_iva_total
    -- (el IVA del rate + el IVA de todos los fees).
    iva_total                   NUMERIC(12,2) NOT NULL DEFAULT 0,

    -- Total final que paga el cliente por la orden.
    -- Fórmula: total = subtotal + iva_total
    -- (también equivale a base_price + fees_subtotal + base_price_iva_amount + fees_iva_total).
    -- Debe coincidir con entry_orders.rate_price_snapshot si este viene informado.
    total                       NUMERIC(12,2) NOT NULL,

    -- ========================================================
    -- 5. AUDITORÍA
    -- ========================================================
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- ========================================================
    -- 6. CONSTRAINTS
    -- ========================================================
    CONSTRAINT entry_order_price_snapshot_order_fkey
        FOREIGN KEY (entry_order_id)
        REFERENCES public.entry_orders (id)
        ON DELETE CASCADE,

    CONSTRAINT entry_order_price_snapshot_tenant_fkey
        FOREIGN KEY (tenant_id)
        REFERENCES public.tenants (id)
        ON DELETE CASCADE,

    -- Una orden no puede tener más de un snapshot de precio.
    CONSTRAINT entry_order_price_snapshot_unique_order
        UNIQUE (entry_order_id),

    -- Ningún monto puede ser negativo.
    CONSTRAINT entry_order_price_snapshot_base_price_check
        CHECK (base_price >= 0),

    CONSTRAINT entry_order_price_snapshot_base_iva_check
        CHECK (base_price_iva_amount >= 0),

    CONSTRAINT entry_order_price_snapshot_fees_subtotal_check
        CHECK (fees_subtotal >= 0),

    CONSTRAINT entry_order_price_snapshot_fees_iva_check
        CHECK (fees_iva_total >= 0),

    CONSTRAINT entry_order_price_snapshot_subtotal_check
        CHECK (subtotal >= 0),

    CONSTRAINT entry_order_price_snapshot_iva_total_check
        CHECK (iva_total >= 0),

    CONSTRAINT entry_order_price_snapshot_total_check
        CHECK (total >= 0),

    -- IVA% siempre entre 0 y 100.
    CONSTRAINT entry_order_price_snapshot_base_iva_pct_check
        CHECK (
            base_price_iva_percentage >= 0
            AND base_price_iva_percentage <= 100
        )
);


-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX entry_order_price_snapshot_tenant_idx
    ON public.entry_order_price_snapshot (tenant_id);



-- ============================================================
-- COMENTARIOS
-- ============================================================

COMMENT ON TABLE public.entry_order_price_snapshot IS
'Snapshot inmutable del precio de una orden de entrada. Guarda el nombre del rate elegido, su base, su IVA y los totales agregados (base + fees + IVA) al momento de la creación. Desacoplado de vehicle_service_rate: si el rate cambia o se borra, el snapshot conserva sus valores. Los datos del vehículo, cliente, funcionario y empresa viven en entry_orders.';

COMMENT ON COLUMN public.entry_order_price_snapshot.id IS
'Identificador único del snapshot.';

COMMENT ON COLUMN public.entry_order_price_snapshot.tenant_id IS
'Tenant dueño del snapshot (denormalizado para RLS e índices).';

COMMENT ON COLUMN public.entry_order_price_snapshot.entry_order_id IS
'Orden de entrada a la que pertenece este snapshot (relación 1:1).';

COMMENT ON COLUMN public.entry_order_price_snapshot.vehicle_service_rate_name IS
'Nombre del rate congelado al momento de la creación de la orden. Se guarda como texto para sobrevivir al renombrado o borrado del rate.';

COMMENT ON COLUMN public.entry_order_price_snapshot.base_price IS
'Precio base del rate al momento de la orden.';

COMMENT ON COLUMN public.entry_order_price_snapshot.base_price_iva_percentage IS
'Porcentaje de IVA aplicado al precio base.';

COMMENT ON COLUMN public.entry_order_price_snapshot.base_price_iva_amount IS
'Monto de IVA calculado sobre el precio base.';

COMMENT ON COLUMN public.entry_order_price_snapshot.fees_subtotal IS
'Suma de los fee_amount (sin IVA) de todos los fees aplicados.';

COMMENT ON COLUMN public.entry_order_price_snapshot.fees_iva_total IS
'Suma del IVA de todos los fees aplicados.';

COMMENT ON COLUMN public.entry_order_price_snapshot.subtotal IS
'Suma de base_price + fees_subtotal (sin IVA).';

COMMENT ON COLUMN public.entry_order_price_snapshot.iva_total IS
'Suma de base_price_iva_amount + fees_iva_total.';

COMMENT ON COLUMN public.entry_order_price_snapshot.total IS
'Total final pagado por la orden (subtotal + iva_total). Debe coincidir con entry_orders.rate_price_snapshot si este viene informado.';

COMMENT ON COLUMN public.entry_order_price_snapshot.created_at IS
'Fecha y hora de creación del snapshot.';


-- 1. Dar permisos a nivel de tabla al rol authenticated
GRANT SELECT, INSERT, DELETE ON public.entry_order_price_snapshot TO authenticated;

-- 2. Hacer lo mismo para la tabla hija (necesaria para el CASCADE)
GRANT SELECT, INSERT, DELETE ON public.entry_order_fee_snapshot TO authenticated;


-- ============================================================
-- RLS (alineado con el patrón de tenant_modules)
-- ============================================================

ALTER TABLE public.entry_order_price_snapshot ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_price_snapshot_by_tenant"
    ON public.entry_order_price_snapshot
    FOR SELECT
    TO authenticated
    USING (
        tenant_id IN (SELECT public.get_my_tenants())
    );

CREATE POLICY "insert_price_snapshot_by_tenant"
    ON public.entry_order_price_snapshot
    FOR INSERT
    TO authenticated
    WITH CHECK (tenant_id IN (SELECT public.get_my_tenants()));

CREATE POLICY "delete_price_snapshot_by_tenant"
    ON public.entry_order_price_snapshot
    FOR DELETE
    TO authenticated
    USING (tenant_id IN (SELECT public.get_my_tenants()));

-- ============================================================
-- TRIGGERS
-- ============================================================


CREATE TRIGGER tr_validate_price_snapshot_totals
    BEFORE INSERT
    ON public.entry_order_price_snapshot
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_price_snapshot_totals();



CREATE TRIGGER tr_prevent_price_snapshot_update
    BEFORE UPDATE
    ON public.entry_order_price_snapshot
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_price_snapshot_update();