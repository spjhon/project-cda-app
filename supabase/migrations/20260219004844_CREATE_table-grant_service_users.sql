-- ===============================
-- Tabla: service_users
-- ===============================



CREATE table public.service_users (
  id uuid primary key default gen_random_uuid(),

  -- Relación con el usuario de Supabase Auth
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,

  full_name text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()

);

COMMENT ON TABLE public.service_users IS 'Version del schema v1';

-- ==========================================
-- Indexes
-- ==========================================

-- Aunque el UNIQUE ya crea un índice,
-- lo dejamos explícito si quieres claridad arquitectónica
-- (no es estrictamente necesario)
-- create unique index service_users_auth_user_id_idx
--   on public.service_users (auth_user_id);



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