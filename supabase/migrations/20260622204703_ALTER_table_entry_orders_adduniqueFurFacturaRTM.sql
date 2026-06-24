ALTER TABLE public.entry_orders
  -- 1. FUR único por Tenant
  ADD CONSTRAINT entry_orders_tenant_fur_key 
    UNIQUE (tenant_id, consecutivo_fur),

  -- 2. RTM único por Tenant
  ADD CONSTRAINT entry_orders_tenant_rtm_key 
    UNIQUE (tenant_id, consecutivo_rtm),

  -- 3. Factura única por Tenant
  ADD CONSTRAINT entry_orders_tenant_factura_key 
    UNIQUE (tenant_id, oficina_consecutivo_factura);