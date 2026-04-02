-- 1. Borramos el que tienes actualmente
drop index if exists public.comments_tenant_ticket_idx;

-- 2. Lo creamos en el orden exacto de la FK
-- Primero ticket_id, luego tenant_id
create index comments_ticket_tenant_idx 
on public.comments (ticket_id, tenant_id)