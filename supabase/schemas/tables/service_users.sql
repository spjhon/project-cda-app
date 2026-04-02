-- ===============================
-- Tabla: service_users
-- ===============================



CREATE table public.service_users (
  id uuid primary key default gen_random_uuid(),

  -- Relación con el usuario de Supabase Auth
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,

  full_name text,

  is_available boolean not null default true,
  job_title text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()

);

COMMENT ON TABLE public.service_users IS 'Version del schema v1';

-- ==========================================
-- Indexes
-- ==========================================

-- 1. Índice para la unión con Supabase Auth (Crucial para el login y RLS)
-- Como auth_user_id es 'unique', Supabase crea un índice automáticamente para el constraint, 
-- pero es bueno tenerlo explícitamente si haces muchos JOINs.
create index if not exists service_users_auth_user_id_idx on public.service_users (auth_user_id);

-- 2. Índice para búsquedas por disponibilidad
-- Si vas a listar usuarios disponibles para asignarles tickets, este es vital
create index if not exists service_users_is_available_idx on public.service_users (is_available);


-- Índice para búsqueda de texto (GIN)
create extension if not exists pg_trgm;
create index if not exists service_users_full_name_trgm_idx on public.service_users using gin (full_name gin_trgm_ops);

-- ==========================================
-- GRANTS
-- ==========================================



-- Permiso para role authenticated
grant select, insert, update, delete
on table public.service_users
to authenticated;

-- Permiso para el service role
grant select, insert, update, delete
on table public.service_users
to service_role;

-- ==========================================
-- RLS
-- ==========================================
alter table public.service_users enable row level security;

create policy "Users can read their own service_user"
on public.service_users
for select
to authenticated
using (auth_user_id = (select auth.uid()));

create policy "Users can insert their own service_user"
on public.service_users
for insert
to authenticated
with check (auth_user_id = (select auth.uid()));

create policy "Users can update their own service_user"
on public.service_users
for update
to authenticated
using (auth_user_id = (select auth.uid()))
with check (auth_user_id = (select auth.uid()));

create policy "Users can delete their own service_user"
on public.service_users
for delete
to authenticated
using (auth_user_id = (select auth.uid()));
