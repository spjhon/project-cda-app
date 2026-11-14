ALTER TABLE public.entry_orders
  ADD COLUMN vehiculo_modelo_snapshot integer NOT NULL DEFAULT 0,
  ADD COLUMN vehiculo_clase_snapshot character varying NOT NULL DEFAULT '',
  ADD COLUMN vehiculo_combustible_snapshot character varying NOT NULL DEFAULT '';