ALTER TABLE public.entry_orders
  DROP CONSTRAINT IF EXISTS entry_orders_tenant_rtm_key;

  CREATE UNIQUE INDEX entry_orders_tenant_rtm_no_reinspeccion_idx
  ON public.entry_orders (tenant_id, consecutivo_rtm)
  WHERE (es_reinspeccion = false OR es_reinspeccion IS NULL)
    AND consecutivo_rtm IS NOT NULL;


    CREATE UNIQUE INDEX entry_orders_tenant_rtm_reinspeccion_idx
  ON public.entry_orders (tenant_id, consecutivo_rtm)
  WHERE es_reinspeccion = true
    AND consecutivo_rtm IS NOT NULL;