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