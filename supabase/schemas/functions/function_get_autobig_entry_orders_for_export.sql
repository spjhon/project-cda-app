CREATE OR REPLACE FUNCTION public.get_autobig_entry_orders_for_export(
  p_tenant_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  fecha TIMESTAMPTZ,
  consecutivo_fur VARCHAR,
  placa VARCHAR,
  pin VARCHAR,
  tipo_inspeccion public.service_type_enum,
  servicio public.vehicle_service_type_enum,
  vehiculo_tipo public.vehicle_type_enum,
  metodos_pago TEXT[],
  empresa TEXT,
  valor_recaudado NUMERIC(12, 2),
  certificado_runt VARCHAR,
  resultado_inspeccion TEXT
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
BEGIN

  -- ============================================================
  -- Validar parámetros obligatorios
  -- ============================================================

  IF p_tenant_id IS NULL THEN
    RAISE EXCEPTION
      'El tenant seleccionado es obligatorio.';
  END IF;

  IF p_start_date IS NULL OR p_end_date IS NULL THEN
    RAISE EXCEPTION
      'El rango de fechas es obligatorio.';
  END IF;

  IF p_start_date > p_end_date THEN
    RAISE EXCEPTION
      'La fecha inicial no puede ser posterior a la fecha final.';
  END IF;

  -- ============================================================
  -- Validar acceso del usuario al tenant
  -- ============================================================

  IF NOT EXISTS (
    SELECT 1
    FROM public.tenant_permissions tp
    JOIN public.service_users su
      ON su.id = tp.service_user_id
    WHERE su.auth_user_id = (SELECT auth.uid())
      AND su.is_active = TRUE
      AND tp.tenant_id = p_tenant_id
  ) THEN
    RAISE EXCEPTION
      'Acceso denegado: el usuario no tiene permisos para este tenant.';
  END IF;

  v_tenant_id := p_tenant_id;

  -- ============================================================
  -- Obtener información de las órdenes y sus pagos
  -- ============================================================

  RETURN QUERY
  SELECT
    eo.fecha,
    eo.consecutivo_fur,
    eo.vehiculo_placa_snapshot AS placa,
    eo.oficina_pin AS pin,

    -- Tipo de inspección
    eo.service_type AS tipo_inspeccion,

    -- Servicio del vehículo: particular, público, etc.
    eo.vehiculo_tipo_servicio_snapshot AS servicio,

    -- Tipo de vehículo: liviano, pesado, motocicleta, etc.
    eo.vehiculo_tipo_snapshot AS vehiculo_tipo,

    -- Array con los métodos de pago asociados a la orden.
    COALESCE(
      (
        SELECT ARRAY_AGG(DISTINCT eop.payment_method::TEXT ORDER BY eop.payment_method::TEXT)
        FROM public.entry_order_payments eop
        WHERE eop.entry_order_id = eo.id
          AND eop.tenant_id = eo.tenant_id
      ),
      ARRAY[]::TEXT[]
    ) AS metodos_pago,

    -- Empresa registrada al momento de crear la orden.
    eo.company_name_snapshot AS empresa,

    -- Valor recaudado registrado en la orden.
    eo.rate_price_snapshot AS valor_recaudado,

    -- Número de certificado RUNT.
    eo.consecutivo_rtm AS certificado_runt,

    -- Resultado de la inspección.
    eo.resultado_revision AS resultado_inspeccion

  FROM public.entry_orders eo

  WHERE eo.tenant_id = v_tenant_id
    AND eo.fecha >= p_start_date
    AND eo.fecha <= p_end_date
    AND eo.deleted_at IS NULL

  ORDER BY eo.fecha DESC;

END;
$$;