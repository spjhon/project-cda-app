ALTER TABLE public.order_signatures
DROP COLUMN signature_url;

ALTER TABLE public.entry_orders
DROP COLUMN funcionario_firma_base64_snapshot,
DROP COLUMN director_tecnico_firma_base64_snapshot;

ALTER TABLE public.service_users
DROP COLUMN signature_base64;