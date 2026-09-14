ALTER TABLE public.entry_orders
ADD COLUMN vehicle_service_rate_id uuid NULL,
ADD COLUMN rate_price_snapshot numeric(12, 2) NULL;

ALTER TABLE public.entry_orders
ADD CONSTRAINT entry_orders_vehicle_service_rate_id_fkey
FOREIGN KEY (vehicle_service_rate_id)
REFERENCES public.vehicle_service_rate (id);

CREATE INDEX entry_orders_vehicle_service_rate_id_idx
ON public.entry_orders (vehicle_service_rate_id);

COMMENT ON COLUMN public.entry_orders.vehicle_service_rate_id IS
  'Identificador de la tarifa de servicio utilizada para la orden de entrada.';

COMMENT ON COLUMN public.entry_orders.rate_price_snapshot IS
  'Valor total de la tarifa calculado y almacenado al momento de crear la orden de entrada.';