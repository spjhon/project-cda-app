-- Índices para mejorar el rendimiento de búsquedas y reportes
CREATE INDEX IF NOT EXISTS entry_orders_cliente_id_idx 
    ON public.entry_orders (cliente_id);

CREATE INDEX IF NOT EXISTS entry_orders_propietario_id_idx 
    ON public.entry_orders (propietario_id);

CREATE INDEX IF NOT EXISTS entry_orders_vehiculo_id_idx 
    ON public.entry_orders (vehiculo_id);