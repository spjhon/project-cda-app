-- ==========================================
-- Tabla: tickets
-- ==========================================

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  
  -- Relación con el tenant (Obligatorio para aislamiento)
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  
  -- Autor del ticket (Relacionado con tu tabla de perfiles públicos)
  created_by uuid not null references public.service_users(id),
  
  -- Datos del ticket
  title text not null check (char_length(title) > 0),
  description text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'done', 'cancelled', 'information_missing')),
  
  -- Auditoría
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ==========================================
-- Comentarios (Schema v1)
-- ==========================================

comment on table public.tickets is 'Versión del schema v1. Almacena los tickets de soporte por tenant.';
comment on column public.tickets.status is 'Estado actual del ticket: open, in_progress, done, cancelled.';
comment on column public.tickets.tenant_id is 'ID del tenant al que pertenece el ticket para aislamiento multi-tenant.';

-- ==========================================
-- Índices estratégicos
-- ==========================================

-- Índice para búsquedas rápidas por tenant (vital para el rendimiento)
create index tickets_tenant_id_idx on public.tickets (tenant_id);
-- Índice para filtrar por creador
create index tickets_created_by_idx on public.tickets (created_by);
-- Índice para filtros de estado
create index tickets_status_idx on public.tickets (status);


-- ==========================================
-- GRANTS
-- ==========================================

grant select, insert, update on table public.tickets to authenticated;
grant all on table public.tickets to service_role;

-- ==========================================
-- RLS (Row Level Security)
-- ==========================================

alter table public.tickets enable row level security;

-- POLÍTICA: Los usuarios solo pueden ver tickets de los tenants a los que pertenecen
create policy "Users can see tickets from their tenants"
on public.tickets
for select
to authenticated
using (
  tenant_id in (
    select tenant_id 
    from public.tenant_permissions 
    where service_user_id in (
      select id from public.service_users where auth_user_id = auth.uid()
    )
  )
);

-- POLÍTICA: Los usuarios pueden crear tickets en los tenants donde son miembros
create policy "Users can create tickets in their tenants"
on public.tickets
for insert
to authenticated
with check (
  tenant_id in (
    select tenant_id 
    from public.tenant_permissions 
    where service_user_id in (
      select id from public.service_users where auth_user_id = auth.uid()
    )
  )
);

/* Esto hace lo mismo que el check de arriba
with check (
  exists (
    select 1 
    from public.tenant_permissions tp
    join public.service_users su on tp.service_user_id = su.id
    where tp.tenant_id = public.tickets.tenant_id -- Vinculamos el ticket con el permiso
    and su.auth_user_id = auth.uid()             -- Vinculamos el permiso con el usuario
  )
);
*/


-- POLÍTICA: Solo el autor (o un admin) puede actualizar el ticket
-- (Aquí puedes simplificarlo o hacerlo más complejo según tus roles)
create policy "Authors can update their own tickets"
on public.tickets
for update
to authenticated
using (
  created_by in (
    select id from public.service_users where auth_user_id = auth.uid()
  )
)
with check (
  created_by in (
    select id from public.service_users where auth_user_id = auth.uid()
  )
);