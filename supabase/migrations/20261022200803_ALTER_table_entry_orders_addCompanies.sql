ALTER TABLE public.entry_orders
ADD COLUMN company_id UUID NULL,
ADD COLUMN company_name_snapshot TEXT NULL,
ADD COLUMN company_nit_snapshot TEXT NULL;


-- Permite usar tenant_id + id como llave foránea compuesta.
ALTER TABLE public.tenants_company
ADD CONSTRAINT tenants_company_tenant_id_id_key
UNIQUE (tenant_id, id);

ALTER TABLE public.entry_orders
ADD CONSTRAINT entry_orders_tenant_company_fkey
FOREIGN KEY (tenant_id, company_id)
REFERENCES public.tenants_company (tenant_id, id)
ON DELETE RESTRICT;

CREATE INDEX entry_orders_tenant_company_fecha_idx
ON public.entry_orders (tenant_id, company_id, fecha DESC)
WHERE company_id IS NOT NULL;

COMMENT ON COLUMN public.entry_orders.company_id IS
'Referencia a la empresa asociada a la orden. Permite identificar la empresa para consultas y estadísticas históricas.';

COMMENT ON COLUMN public.entry_orders.company_name_snapshot IS
'Nombre de la empresa al momento de registrar la orden. Se conserva como dato histórico aunque el nombre actual cambie.';

COMMENT ON COLUMN public.entry_orders.company_nit_snapshot IS
'NIT de la empresa al momento de registrar la orden. Se conserva como dato histórico ante cambios posteriores.';

