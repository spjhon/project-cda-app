-- ==========================================
-- Tabla: tenants
-- ==========================================



create table public.tenants (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  domain text not null unique,
  slug text not null unique,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Reglas estructurales
  constraint tenants_name_length_check check (char_length(name) >= 2),
  constraint tenants_slug_format_check check (slug ~ '^[a-z0-9-]+$')
);



-- ==========================================
-- Comentarios (documentación viva)
-- ==========================================

-- ==========================================
-- VERSION DE LA TABLA CON SUS INDEX, GRANTS Y POLICIES
COMMENT ON TABLE public.tenants IS 'Version del schema v1';
-- ==========================================

comment on table public.tenants is 'Tenant root entity for multi-tenant isolation. Represents an organization/customer.';

comment on column public.tenants.domain is 'Primary custom domain for the tenant (must be unique).';

comment on column public.tenants.slug is 'URL-safe identifier used for subdomain or routing. Lowercase, alphanumeric and hyphens only.';

-- ==========================================
-- Índices adicionales
-- ==========================================

-- UNIQUE ya crea índices, pero si planeas búsquedas frecuentes por created_at:
create index tenants_created_at_idx on public.tenants (created_at);

-- ==========================================
-- Seguridad estructural (GRANTS)
-- ==========================================

grant select on table public.tenants to authenticated;

grant all on table public.tenants to service_role;

-- ==========================================
-- RLS
-- ==========================================

alter table public.tenants enable row level security;

-- Nota:
-- Esta tabla normalmente NO debería permitir a usuarios crear tenants libremente.
-- Normalmente esto lo hace el backend con service_role.
-- Aquí asumimos que solo lectura pública es permitida.


--Entonces ¿qué está comprobando exactamente el EXISTS? El EXISTS pregunta:
--¿Hay al menos una fila en tenant_permissions
--que:
--pertenezca a este tenant
--y cuyo service_user esté asociado al usuario autenticado?


create policy "Acceso total verificado: JWT + Base de Datos"
on public.tenants
for select
to authenticated
using (
  -- 1. Filtro de primera línea (JWT)
  -- Buscamos el slug de la fila actual dentro del array de tenants del JWT
  (((select auth.jwt()) -> 'app_metadata' -> 'tenants') ? tenants.slug)
  
  AND 
  
  -- 2. Verdad absoluta (Base de Datos)
  exists (
    select 1 
    from public.tenant_permissions tp
    inner join public.service_users su on tp.service_user_id = su.id
    where tp.tenant_id = tenants.id  -- Referencia a la fila evaluada
    and su.auth_user_id = (select auth.uid()) -- Filtro por el usuario actual
  )
);







/*
create policy "Solo usuarios autenticados pueden leer sus propios tenants"
on public.tenants
for select
to authenticated
using (
  exists (
    select 1 
    from public.tenant_permissions tp inner join public.service_users su on tp.service_user_id = su.id
    /*
    Significa:
      Combina filas donde tenant_permissions.service_user_id sea igual a service_users.id
    */
    where tp.tenant_id = public.tenants.id
    and su.auth_user_id = auth.uid()
)
);





COALESCE(
(auth.jwt() -> 'app_metadata' -> 'tenants') ? tenants.id::text,
false
)
*/