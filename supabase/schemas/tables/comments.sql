-- ==========================================
-- Tabla: comments
-- ==========================================

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  
  -- Relaciones
  ticket_id uuid not null,
  tenant_id uuid not null,
  created_by uuid not null references public.service_users(id),
  
  -- Datos del comentario
  comment_text text not null check (char_length(comment_text) > 0),
  
  -- Caché del autor (Desnormalización para evitar JOINs constantes en el front)
  author_name text not null,
  
  -- Auditoría
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Constraint de integridad compuesta (Necesario para ser igual al Código 1)
  constraint fk_comments_to_tickets foreign key (ticket_id, tenant_id) 
    references public.tickets (id, tenant_id) on delete cascade
);

-- ==========================================
-- Índices para rendimiento (crucial para RLS y carga de listas)
-- ==========================================

-- Índice para el autor (Opcional pero recomendado)
-- Si vas a mostrar "Comentarios de X usuario", este te servirá mucho
create index comments_created_by_idx on public.comments (created_by);


-- Índice compuesto para consultas de tickets dentro de un tenant y para la FK
-- Primero ticket_id, luego tenant_id
create index comments_ticket_tenant_idx on public.comments (ticket_id, tenant_id);


-- ==========================================
-- GRANTS
-- ==========================================

grant select, insert, update on table public.comments to authenticated;
grant all on table public.comments to service_role;





-- ==========================================
-- RLS (Row Level Security)
-- ==========================================

alter table public.comments enable row level security;

-- POLÍTICA: Solo los miembros del tenant pueden ver los comentarios
create policy "Users can see comments from their tenants"
on public.comments
for select
to authenticated
using (
  tenant_id in (
    select tenant_id 
    from public.tenant_permissions 
    where service_user_id in (
      select id from public.service_users where auth_user_id = (select auth.uid())
    )
  )
);

-- POLÍTICA: Solo miembros del tenant pueden insertar comentarios en tickets de ese tenant
create policy "Users can insert comments in their tenants"
on public.comments
for insert
to authenticated
with check (
  tenant_id in (
    select tenant_id 
    from public.tenant_permissions 
    where service_user_id in (
      select id from public.service_users where auth_user_id = (select auth.uid())
    )
  )
);

-- POLÍTICA: Solo miembros que tengan su tenant puede borrar comentarios
create policy "Users can delete comments from their tenats"
on public.comments
for delete
to authenticated
using (

  created_by = (
    select id from public.service_users where auth_user_id = (select auth.uid())
  )

  OR

  tenant_id in (
    select tenant_id 
    from public.tenant_permissions 
    where service_user_id in (
      select id from public.service_users where auth_user_id = (select auth.uid())
    )
  )
);