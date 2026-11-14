-- ============================================================
-- TABLA: entry_order_fee_snapshot
-- Propósito:
--   Snapshot inmutable de CADA fee aplicado a una orden.
--   Es la tabla hija de entry_order_price_snapshot (1:N).
--
--   Congela el nombre, la descripción, el monto y el IVA de
--   cada fee al momento exacto de crear la orden.
--
--   Desacoplada totalmente de fee_types: si mañana cambias o
--   borras un fee, este snapshot NO se entera y conserva sus
--   valores históricos.
--
--   Aquí SÍ vive vehicle_age_years, porque la edad del vehículo
--   es un criterio de aplicación de cada fee (rango from/to).
-- ============================================================

CREATE TABLE public.entry_order_fee_snapshot (
    -- ========================================================
    -- 1. IDENTIFICACIÓN
    -- ========================================================
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tenant dueño del snapshot (denormalizado para RLS e índices).
    tenant_id                   UUID NOT NULL,

    -- Snapshot cabecera al que pertenece este fee (relación 1:N).
    entry_order_price_snapshot_id UUID NOT NULL,

    -- ========================================================
    -- 2. CONTEXTO DEL FEE (texto congelado, sin FK)
    -- ========================================================
    -- Nombre del fee al momento de la orden.
    -- Se guarda como texto para sobrevivir al renombrado o borrado del fee.
    fee_name                    TEXT NOT NULL,

    -- Descripción del fee al momento de la orden.
    -- Puede ser NULL si el fee original no tenía descripción.
    fee_description             TEXT NULL,

    -- ========================================================
    -- 3. CRITERIO DE EDAD (por qué se aplicó este fee)
    -- ========================================================
    -- Edad del vehículo en años al momento de la orden.
    -- Se calcula como (año de la orden - año del modelo del vehículo).
    vehicle_age_years           INTEGER NULL,

    -- Rango de edad del fee al momento de la orden.
    -- from = NULL significa "sin límite inferior".
    vehicle_age_from            INTEGER NULL,

    -- Rango de edad del fee al momento de la orden.
    -- to = NULL significa "sin límite superior".
    vehicle_age_to              INTEGER NULL,

    -- ========================================================
    -- 4. MONTOS CONGELADOS DEL FEE
    -- ========================================================
    -- Monto base del fee, sin IVA.
    fee_amount                  NUMERIC(12,2) NOT NULL,

    -- Porcentaje de IVA aplicado a este fee (0 si no aplica).
    iva_percentage              NUMERIC(5,2)  NOT NULL DEFAULT 0,

    -- Monto de IVA calculado sobre el fee.
    -- Fórmula: iva_amount = fee_amount * iva_percentage / 100
    iva_amount                  NUMERIC(12,2) NOT NULL DEFAULT 0,

    -- Total del fee con IVA incluido.
    -- Fórmula: fee_total = fee_amount + iva_amount
    fee_total                   NUMERIC(12,2) NOT NULL,

    -- ========================================================
    -- 5. AUDITORÍA
    -- ========================================================
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- ========================================================
    -- 6. CONSTRAINTS
    -- ========================================================
    -- Si se borra la cabecera, sus fees se borran en cascada.
    CONSTRAINT entry_order_fee_snapshot_price_fkey
        FOREIGN KEY (entry_order_price_snapshot_id)
        REFERENCES public.entry_order_price_snapshot (id)
        ON DELETE CASCADE,

    CONSTRAINT entry_order_fee_snapshot_tenant_fkey
        FOREIGN KEY (tenant_id)
        REFERENCES public.tenants (id)
        ON DELETE CASCADE,

    -- Ningún monto puede ser negativo.
    CONSTRAINT entry_order_fee_snapshot_fee_amount_check
        CHECK (fee_amount >= 0),

    CONSTRAINT entry_order_fee_snapshot_iva_amount_check
        CHECK (iva_amount >= 0),

    CONSTRAINT entry_order_fee_snapshot_fee_total_check
        CHECK (fee_total >= 0),

    -- IVA% siempre entre 0 y 100.
    CONSTRAINT entry_order_fee_snapshot_iva_pct_check
        CHECK (
            iva_percentage >= 0
            AND iva_percentage <= 100
        ),

    -- La edad del vehículo, si viene informada, nunca es negativa.
    CONSTRAINT entry_order_fee_snapshot_age_check
        CHECK (vehicle_age_years IS NULL OR vehicle_age_years >= 0),

    -- El rango de edad debe ser coherente (from <= to cuando ambos existen).
    CONSTRAINT entry_order_fee_snapshot_age_range_check
        CHECK (
            vehicle_age_from IS NULL
            OR vehicle_age_to IS NULL
            OR vehicle_age_from <= vehicle_age_to
        )
);


-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX entry_order_fee_snapshot_price_idx
    ON public.entry_order_fee_snapshot (entry_order_price_snapshot_id);

CREATE INDEX entry_order_fee_snapshot_tenant_idx
    ON public.entry_order_fee_snapshot (tenant_id);





-- ============================================================
-- COMENTARIOS
-- ============================================================

COMMENT ON TABLE public.entry_order_fee_snapshot IS
'Snapshot inmutable de cada fee aplicado a una orden. Es la tabla hija de entry_order_price_snapshot (1:N). Congela nombre, descripción, monto, IVA y rango de edad del fee al momento de la creación. Desacoplada de fee_types: si el fee cambia o se borra, el snapshot conserva sus valores.';

COMMENT ON COLUMN public.entry_order_fee_snapshot.id IS
'Identificador único del snapshot de fee.';

COMMENT ON COLUMN public.entry_order_fee_snapshot.tenant_id IS
'Tenant dueño del snapshot (denormalizado para RLS e índices).';

COMMENT ON COLUMN public.entry_order_fee_snapshot.entry_order_price_snapshot_id IS
'Snapshot cabecera al que pertenece este fee (relación 1:N).';

COMMENT ON COLUMN public.entry_order_fee_snapshot.fee_name IS
'Nombre del fee congelado al momento de la creación de la orden.';

COMMENT ON COLUMN public.entry_order_fee_snapshot.fee_description IS
'Descripción del fee congelada al momento de la creación de la orden.';

COMMENT ON COLUMN public.entry_order_fee_snapshot.vehicle_age_years IS
'Edad del vehículo en años al momento de la orden (año de la orden - año del modelo).';

COMMENT ON COLUMN public.entry_order_fee_snapshot.vehicle_age_from IS
'Límite inferior del rango de edad del fee al momento de la orden (NULL = sin límite).';

COMMENT ON COLUMN public.entry_order_fee_snapshot.vehicle_age_to IS
'Límite superior del rango de edad del fee al momento de la orden (NULL = sin límite).';

COMMENT ON COLUMN public.entry_order_fee_snapshot.fee_amount IS
'Monto base del fee, sin IVA.';

COMMENT ON COLUMN public.entry_order_fee_snapshot.iva_percentage IS
'Porcentaje de IVA aplicado a este fee.';

COMMENT ON COLUMN public.entry_order_fee_snapshot.iva_amount IS
'Monto de IVA calculado sobre el fee (fee_amount * iva_percentage / 100).';

COMMENT ON COLUMN public.entry_order_fee_snapshot.fee_total IS
'Total del fee con IVA incluido (fee_amount + iva_amount).';

COMMENT ON COLUMN public.entry_order_fee_snapshot.created_at IS
'Fecha y hora de creación del snapshot de fee.';


-- ============================================================
-- RLS (alineado con el patrón de tenant_modules)
-- ============================================================

ALTER TABLE public.entry_order_fee_snapshot ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_fee_snapshot_by_tenant"
    ON public.entry_order_fee_snapshot
    FOR SELECT
    TO authenticated
    USING (
        tenant_id IN (SELECT public.get_my_tenants())
    );


-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER tr_validate_fee_snapshot_totals
    BEFORE INSERT
    ON public.entry_order_fee_snapshot
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_fee_snapshot_totals();


CREATE TRIGGER tr_prevent_fee_snapshot_update
    BEFORE UPDATE
    ON public.entry_order_fee_snapshot
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_fee_snapshot_update();