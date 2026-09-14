

-- ============================================================
-- TABLE: entry_order_payments
-- ============================================================

CREATE TABLE public.entry_order_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),

  tenant_id uuid NOT NULL,

  entry_order_id uuid NOT NULL,

  payment_method public.office_payment_type_enum NOT NULL,

  monto_bruto numeric(12, 2) NOT NULL,

  num_comprobante text NULL,

  created_at timestamp with time zone NOT NULL DEFAULT now(),

  updated_at timestamp with time zone NOT NULL DEFAULT now(),

  CONSTRAINT entry_order_payments_pkey
    PRIMARY KEY (id),

  CONSTRAINT entry_order_payments_tenant_id_fkey
    FOREIGN KEY (tenant_id)
    REFERENCES public.tenants (id)
    ON DELETE RESTRICT,

  CONSTRAINT entry_order_payments_entry_order_id_fkey
    FOREIGN KEY (entry_order_id)
    REFERENCES public.entry_orders (id)
    ON DELETE RESTRICT,

  CONSTRAINT entry_order_payments_monto_bruto_check
    CHECK (monto_bruto > 0)
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX entry_order_payments_tenant_id_idx
  ON public.entry_order_payments
  USING btree (tenant_id);

CREATE INDEX entry_order_payments_entry_order_id_idx
  ON public.entry_order_payments
  USING btree (entry_order_id);

CREATE INDEX entry_order_payments_payment_method_idx
  ON public.entry_order_payments
  USING btree (payment_method);


-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE public.entry_order_payments IS
  'Registra los pagos realizados para cada orden de entrada, permitiendo múltiples métodos de pago por orden.';

COMMENT ON COLUMN public.entry_order_payments.id IS
  'Identificador único del registro de pago.';

COMMENT ON COLUMN public.entry_order_payments.tenant_id IS
  'Identificador del tenant al que pertenece el pago.';

COMMENT ON COLUMN public.entry_order_payments.entry_order_id IS
  'Identificador de la orden de entrada asociada al pago.';

COMMENT ON COLUMN public.entry_order_payments.payment_method IS
  'Método utilizado para realizar el pago.';

COMMENT ON COLUMN public.entry_order_payments.monto_bruto IS
  'Valor bruto recaudado mediante este método de pago.';

COMMENT ON COLUMN public.entry_order_payments.num_comprobante IS
  'Número de comprobante, voucher o referencia de la transacción cuando aplica.';

COMMENT ON COLUMN public.entry_order_payments.created_at IS
  'Fecha y hora en que se registró el pago.';


-- ============================================================
-- GRANTS
-- ============================================================

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.entry_order_payments
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.entry_order_payments
TO service_role;


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.entry_order_payments
ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- RLS: SELECT
-- ============================================================

CREATE POLICY select_entry_order_payments_by_tenant
ON public.entry_order_payments
FOR SELECT
TO authenticated
USING (
  tenant_id IN (
    SELECT public.get_my_tenants()
  )
);


-- ============================================================
-- RLS: INSERT
-- ============================================================

CREATE POLICY insert_entry_order_payments_by_tenant
ON public.entry_order_payments
FOR INSERT
TO authenticated
WITH CHECK (
  tenant_id IN (
    SELECT public.get_my_tenants()
  )
);


-- ============================================================
-- RLS: UPDATE
-- ============================================================

CREATE POLICY update_entry_order_payments_by_tenant
ON public.entry_order_payments
FOR UPDATE
TO authenticated
USING (
  tenant_id IN (
    SELECT public.get_my_tenants()
  )
)
WITH CHECK (
  tenant_id IN (
    SELECT public.get_my_tenants()
  )
);


-- ============================================================
-- RLS: DELETE
-- ============================================================

CREATE POLICY delete_entry_order_payments_by_tenant
ON public.entry_order_payments
FOR DELETE
TO authenticated
USING (
  tenant_id IN (
    SELECT public.get_my_tenants()
  )
);