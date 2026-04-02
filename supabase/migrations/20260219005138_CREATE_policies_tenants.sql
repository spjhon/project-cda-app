
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
  -- 1. Verificación rápida por JWT (Filtro de primera línea)
  ((auth.jwt() -> 'app_metadata' -> 'tenants') ? slug::text)
  
  AND -- AMBAS deben cumplirse
  
  -- 2. Verificación en tiempo real en la DB (Verdad absoluta)
  exists (
    select 1 
    from public.tenant_permissions tp
    inner join public.service_users su on tp.service_user_id = su.id
    where tp.tenant_id = public.tenants.id
    and su.auth_user_id = auth.uid()
  )
);
