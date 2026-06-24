ALTER TABLE public.entry_orders DROP CONSTRAINT IF EXISTS entry_orders_tenant_factura_key;

CREATE UNIQUE INDEX entry_orders_tenant_factura_no_reinspeccion_idx 
ON public.entry_orders (tenant_id, oficina_consecutivo_factura)
WHERE (es_reinspeccion = false OR es_reinspeccion IS NULL);

CREATE UNIQUE INDEX entry_orders_tenant_oficina_pin_no_reinspeccion_idx 
ON public.entry_orders (tenant_id, oficina_pin)
WHERE (es_reinspeccion = false OR es_reinspeccion IS NULL);