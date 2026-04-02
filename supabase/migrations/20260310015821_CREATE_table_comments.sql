-- ==========================================
-- Tabla: comments
-- ==========================================

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  
  -- Relaciones
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  created_by uuid not null references public.service_users(id),
  
  -- Datos del comentario
  comment_text text not null check (char_length(comment_text) > 0),
  
  -- Caché del autor (Desnormalización para evitar JOINs constantes en el front)
  author_name text not null,
  
  -- Auditoría
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ==========================================
-- Índices para rendimiento (crucial para RLS y carga de listas)
-- ==========================================

-- Índice para filtrar comentarios por ticket (la consulta principal: "ver comentarios del ticket X")
create index comments_ticket_id_idx on public.comments (ticket_id);

-- Índice para el RLS (búsquedas por tenant)
create index comments_tenant_id_idx on public.comments (tenant_id);


-- ==========================================
-- GRANTS
-- ==========================================

grant select, insert, update on table public.comments to authenticated;
grant all on table public.comments to service_role;