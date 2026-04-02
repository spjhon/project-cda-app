-- 1. Borramos el índice individual del tenant (el compuesto lo reemplaza)
drop index if exists comments_tenant_id_idx;

drop index if exists comments_ticket_id_idx;


-- Índice compuesto para consultas de tickets dentro de un tenant y para la FK
create index comments_tenant_ticket_idx on public.comments (tenant_id, ticket_id);

-- 3. Índice para el autor (Opcional pero recomendado)
-- Si vas a mostrar "Comentarios de X usuario", este te servirá mucho
create index comments_created_by_idx on public.comments (created_by);