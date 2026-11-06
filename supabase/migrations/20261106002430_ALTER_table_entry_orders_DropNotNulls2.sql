-- Permitir órdenes sin vehículo asociado
ALTER TABLE public.entry_orders
ALTER COLUMN vehiculo_id DROP NOT NULL;