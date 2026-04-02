
-- ==========================================
-- Tabla: tickets, OJO, OBSERVAR SI SE CREA LA RELACION CON EL TICKET COMPUESTO SI SE UTILIZA ESTE CODIGO Y NO LAS MIGRACIONES
-- ==========================================

create table public.tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),

  -- Identificador humano secuencial por tenant
  ticket_number bigint not null, -- Se llena vía Trigger
  
  -- Relación con el tenant (Obligatorio para aislamiento y particionamiento)
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Autor del ticket (Relacionado con tu tabla de perfiles públicos)
  created_by uuid not null references public.service_users(id),
  assignee uuid references public.service_users(id) on delete set null,
  
  -- Datos del ticket
  title text not null check (char_length(title) > 0),
  description text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'done', 'cancelled', 'information_missing')),
  assignee_name text,
  
  -- Auditoría
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- CONSTRAINT DE UNICIDAD Y PK: 
  -- En tablas particionadas, la columna de partición DEBE estar en la PK
  PRIMARY KEY (id, tenant_id),
  -- CONSTRAINT DE UNICIDAD: Evita duplicados de número dentro del mismo cliente
  CONSTRAINT unique_ticket_number_per_tenant UNIQUE (tenant_id, ticket_number)
) PARTITION BY LIST (tenant_id);

-- ==========================================
-- Comentarios (Schema v1)
-- ==========================================

comment on table public.tickets is 'Esta es la v2, particionada por tenant_id';
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
create index if not exists tickets_assignee_idx on public.tickets (assignee);

-- Búsqueda ultra rápida por número (usado en URLs: /tenant/tickets/42)
create index tickets_tenant_ticket_num_idx on public.tickets (tenant_id, ticket_number);
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
      select id from public.service_users where auth_user_id = (select auth.uid())
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
      select id from public.service_users where auth_user_id = (select auth.uid())
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
    select id from public.service_users where auth_user_id = (select auth.uid())
  )
)
with check (
  created_by in (
    select id from public.service_users where auth_user_id = (select auth.uid())
  )
);



create policy "Users can delete own tickets"
on public.tickets
for delete
to authenticated
using (
  exists (
    select 1 
    from public.service_users su
    join public.tenant_permissions tp on tp.service_user_id = su.id
    where su.auth_user_id = (select auth.uid())
    and public.tickets.created_by = su.id
    and public.tickets.tenant_id = tp.tenant_id
  )
);






/*
-- (esta es una forma de DELETE POCO EFICIENTE)
create policy "Users can delete own tickets"
on public.tickets
for delete
to authenticated
using (
  created_by in (
    select id from public.service_users where auth_user_id = auth.uid()
  ) and
  tenant_id in (
    select tenant_id 
    from public.tenant_permissions 
    where service_user_id in (
      select id from public.service_users where auth_user_id = auth.uid()
    )
  )
)
*/