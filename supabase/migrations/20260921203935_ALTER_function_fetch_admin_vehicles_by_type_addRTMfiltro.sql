create or replace function public.fetch_admin_vehicles_by_type(
  p_tenant_id uuid,
  p_fecha_desde date default current_date,
  p_fecha_hasta date default current_date
)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_object_agg(
    enum_value::text,
    coalesce(counts.cantidad, 0)
  )
  from unnest(enum_range(null::vehicle_type_enum)) as enum_value
  left join (
    select
      vehiculo_tipo_snapshot as vehicle_type,
      count(*)::integer as cantidad
    from entry_orders
    where tenant_id = p_tenant_id
      and service_type = 'RTM'
      and deleted_at is null
      and estado_orden is distinct from 'anulada'
      and (
        es_reinspeccion = false
        or es_reinspeccion is null
      )
      and fecha::date >= p_fecha_desde
      and fecha::date <= p_fecha_hasta
    group by vehiculo_tipo_snapshot
  ) counts
    on counts.vehicle_type = enum_value;
$$;