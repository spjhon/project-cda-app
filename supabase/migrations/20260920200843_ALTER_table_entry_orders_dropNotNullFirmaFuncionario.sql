-- Permitir valores nulos en la columna de la firma
alter table public.entry_orders 
alter column funcionario_firma_base64_snapshot drop not null;