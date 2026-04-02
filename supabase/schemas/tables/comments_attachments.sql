create table public.comment_attachments (
  id uuid primary key default gen_random_uuid(),
  
  -- Relaciones
  comment_id uuid not null references public.comments(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  
  -- Datos
  file_path text not null,
  
  -- Auditoría
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
);

-- IMPORTANTÍSIMO: Índice para velocidad
create index comment_attachments_tenant_id_idx on public.comment_attachments (tenant_id);
create index comment_attachments_comment_id_idx on public.comment_attachments (comment_id);



-- ==========================================
-- Comentarios (Schema v1)
-- ==========================================

comment on table public.comment_attachments is 'Ultima actualizacion del schema: Marzo 12 2026';
comment on column public.comment_attachments.tenant_id is 'ID del tenant al que pertenece el ticket para aislamiento multi-tenant.';


-- ==========================================
-- GRANTS
-- ==========================================

grant select, insert, update on table comment_attachments to authenticated;
grant all on table comment_attachments to service_role;

-- ==========================================
-- RLS (Row Level Security)
-- ==========================================

alter table public.comment_attachments enable row level security;

-- Política: Solo miembros del tenant pueden ver sus archivos adjuntos
create policy "Users can see attachments from their tenants"
on public.comment_attachments
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


-- Política para permitir el INSERT
create policy "Users can insert attachments into their tenants"
on public.comment_attachments
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