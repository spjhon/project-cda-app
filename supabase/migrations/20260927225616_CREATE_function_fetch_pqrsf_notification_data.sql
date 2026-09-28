create or replace function public.fetch_pqrsf_notification_data(
  p_requirement_id uuid
)
returns table (
  cda_name text,
  cda_domain text,
  recipient_email text,
  recipient_name text,
  sender_name text,
  sender_email text,
  sender_phone text,
  placa varchar,
  description text,
  requirement_type text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    t.name as cda_name,
    t.domain as cda_domain,
    au.email as recipient_email,
    su.full_name as recipient_name,
    sr.sender_name,
    sr.sender_email,
    sr.sender_phone,
    sr.placa,
    sr.description,
    sr.requirement_type,
    sr.created_at
  from public.service_requirements sr
  inner join public.tenants t
    on t.id = sr.tenant_id
  inner join public.tenant_permissions tp
    on tp.tenant_id = sr.tenant_id
  inner join public.service_users su
    on su.id = tp.service_user_id
  inner join auth.users au
    on au.id = su.auth_user_id
  where sr.id = p_requirement_id
    and tp.role = 'gerente'
    and su.is_active = true
    and au.email is not null;
$$;