CREATE OR REPLACE FUNCTION public.get_entry_orders_for_export(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  id UUID,
  consecutivo INT,
  fecha TIMESTAMPTZ,
  placa VARCHAR,
  marca VARCHAR,
  linea VARCHAR,
  modelo INT,
  cilindraje INT,
  
  -- Propietario Snapshots
  propietario_nombre TEXT,
  propietario_documento VARCHAR,
  propietario_tipo_documento TEXT,
  propietario_telefono VARCHAR,
  propietario_email TEXT,
  propietario_direccion TEXT,

  -- Cliente Snapshots
  cliente_nombre TEXT,
  cliente_documento VARCHAR,
  cliente_tipo_documento TEXT,
  cliente_telefono VARCHAR,
  cliente_email TEXT,
  cliente_direccion TEXT,

  -- Operativos y Vehículo
  es_reinspeccion BOOLEAN,
  kilometraje VARCHAR,
  soat_vencimiento_snapshot DATE,
  service_type public.service_type_enum,
  vehiculo_tipo_snapshot public.vehicle_type_enum,
  vehiculo_tipo_servicio_snapshot public.vehicle_service_type_enum,
  estado_orden public.order_status_enum,

  -- Información de Oficina
  oficina_pin VARCHAR,
  oficina_pago NUMERIC(12,2),
  oficina_consecutivo_factura VARCHAR,
  oficina_tipo_pago public.office_payment_type_enum,
  oficina_num_aprobacion VARCHAR,
  se_compro_soat BOOLEAN,
  resultado_revision TEXT,

  -- ISO 17020 / Cierre
  consecutivo_fur VARCHAR,
  consecutivo_rtm VARCHAR


)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- Obtener el tenant_id del usuario autenticado actual desde permisos
  SELECT tp.tenant_id INTO v_tenant_id
  FROM public.tenant_permissions tp
  JOIN public.service_users su ON su.id = tp.service_user_id
  WHERE su.auth_user_id = auth.uid()
  LIMIT 1;

  -- Si el usuario no pertenece a ningún tenant activo, retornamos vacío
  IF v_tenant_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    eo.id,
    eo.consecutivo,
    eo.fecha,
    eo.vehiculo_placa_snapshot AS placa,
    eo.vehiculo_marca_snapshot AS marca,
    eo.vehiculo_linea_snapshot AS linea,
    eo.vehiculo_modelo_snapshot AS modelo,
    eo.vehiculo_cilindrada_snapshot AS cilindraje,

    -- Propietario
    eo.propietario_nombre_snapshot AS propietario_nombre,
    eo.propietario_numero_documento_snapshot AS propietario_documento,
    eo.propietario_tipo_documento_snapshot AS propietario_tipo_documento,
    eo.propietario_telefono_snapshot AS propietario_telefono,
    eo.propietario_email_snapshot AS propietario_email,
    eo.propietario_direccion_snapshot AS propietario_direccion,

    -- Cliente
    eo.cliente_nombre_snapshot AS cliente_nombre,
    eo.cliente_numero_documento_snapshot AS cliente_documento,
    eo.cliente_tipo_documento_snapshot AS cliente_tipo_documento,
    eo.cliente_telefono_snapshot AS cliente_telefono,
    eo.cliente_email_snapshot AS cliente_email,
    eo.cliente_direccion_snapshot AS cliente_direccion,

    -- Operativos
    eo.es_reinspeccion,
    eo.kilometraje,
    eo.soat_vencimiento_snapshot,
    eo.service_type,
    eo.vehiculo_tipo_snapshot,
    eo.vehiculo_tipo_servicio_snapshot,
    eo.estado_orden,

    -- Oficina
    eo.oficina_pin,
    eo.oficina_pago,
    eo.oficina_consecutivo_factura,
    eo.oficina_tipo_pago,
    eo.oficina_num_aprobacion,
    eo.se_compro_soat,
    eo.resultado_revision,

    -- ISO 17020
    eo.consecutivo_fur,
    eo.consecutivo_rtm

    

  FROM public.entry_orders eo
  WHERE eo.tenant_id = v_tenant_id
    AND eo.fecha >= p_start_date 
    AND eo.fecha <= p_end_date
    AND eo.deleted_at IS NULL
  ORDER BY eo.fecha DESC;
END;
$$;