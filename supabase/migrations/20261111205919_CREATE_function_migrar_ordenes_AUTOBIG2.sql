CREATE OR REPLACE FUNCTION public.migrar_ordenes_AUTOBIG(p_data JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_row JSONB;
  v_order_id UUID;
  v_payment JSONB;
  v_count INT := 0;
  v_payment_count INT := 0;
BEGIN
  -- Validar que el array no esté vacío
  IF p_data IS NULL OR jsonb_typeof(p_data) <> 'array' OR jsonb_array_length(p_data) = 0 THEN
    RAISE EXCEPTION 'El array de datos está vacío o no es válido.';
  END IF;

  -- Iterar sobre cada orden del array
  FOR v_row IN SELECT * FROM jsonb_array_elements(p_data)
  LOOP
    -- ============================================================
    -- 1. INSERTAR LA ORDEN EN entry_orders
    -- ============================================================
    INSERT INTO public.entry_orders (
      tenant_id,
      funcionario_id,
      fecha,
      consecutivo_fur,
      vehiculo_placa_snapshot,
      vehiculo_marca_snapshot,
      vehiculo_linea_snapshot,
      vehiculo_modelo_snapshot,
      vehiculo_clase_snapshot,
      vehiculo_combustible_snapshot,
      vehiculo_tipo_snapshot,
      vehiculo_tipo_servicio_snapshot,
      vehiculo_blindaje_snapshot,
      vehiculo_es_ensenanza_snapshot,
      vehiculo_es_extranjero_snapshot,
      es_reinspeccion,
      service_type,
      estado_orden,
      oficina_pin,
      rate_price_snapshot,
      resultado_revision,
      consecutivo_rtm,
      company_name_snapshot,
      funcionario_tipo_documento_snapshot,
      funcionario_numero_documento_snapshot,
      funcionario_nombre_snapshot
    ) VALUES (
      (v_row->>'tenant_id')::UUID,
      (v_row->>'funcionario_id')::UUID,
      (v_row->>'fecha')::TIMESTAMPTZ,
      v_row->>'consecutivo_fur',
      v_row->>'vehiculo_placa_snapshot',
      v_row->>'vehiculo_marca_snapshot',
      v_row->>'vehiculo_linea_snapshot',
      (v_row->>'vehiculo_modelo_snapshot')::INTEGER,
      v_row->>'vehiculo_clase_snapshot',
      v_row->>'vehiculo_combustible_snapshot',
      (v_row->>'vehiculo_tipo_snapshot')::public.vehicle_type_enum,
      (v_row->>'vehiculo_tipo_servicio_snapshot')::public.vehicle_service_type_enum,
      (v_row->>'vehiculo_blindaje_snapshot')::BOOLEAN,
      (v_row->>'vehiculo_es_ensenanza_snapshot')::BOOLEAN,
      (v_row->>'vehiculo_es_extranjero_snapshot')::BOOLEAN,
      (v_row->>'es_reinspeccion')::BOOLEAN,
      (v_row->>'service_type')::public.service_type_enum,
      (v_row->>'estado_orden')::public.order_status_enum,
      NULLIF(v_row->>'oficina_pin', ''),
      (v_row->>'rate_price_snapshot')::NUMERIC,
      v_row->>'resultado_revision',
      NULLIF(v_row->>'consecutivo_rtm', ''),
      NULLIF(v_row->>'company_name_snapshot', ''),
      v_row->>'funcionario_tipo_documento_snapshot',
      v_row->>'funcionario_numero_documento_snapshot',
      v_row->>'funcionario_nombre_snapshot'
    )
    RETURNING id INTO v_order_id;

    v_count := v_count + 1;

    -- ============================================================
    -- 2. INSERTAR LOS PAGOS EN entry_order_payments
    -- ============================================================
    -- Verificar si el payload trae pagos
    IF v_row ? 'payments' AND jsonb_typeof(v_row->'payments') = 'array' THEN
      FOR v_payment IN SELECT * FROM jsonb_array_elements(v_row->'payments')
      LOOP
        INSERT INTO public.entry_order_payments (
          tenant_id,
          entry_order_id,
          payment_method,
          monto_bruto,
          num_comprobante
        ) VALUES (
          (v_row->>'tenant_id')::UUID,
          v_order_id,
          (v_payment->>'payment_method')::public.office_payment_type_enum,
          (v_payment->>'monto_bruto')::NUMERIC,
          NULLIF(v_payment->>'num_comprobante', '')
        );
        
        v_payment_count := v_payment_count + 1;
      END LOOP;
    END IF;
  END LOOP;

  -- ============================================================
  -- 3. RETORNAR RESULTADO
  -- ============================================================
  RETURN jsonb_build_object(
    'success', true,
    'ordenes_insertadas', v_count,
    'pagos_insertados', v_payment_count
  );

EXCEPTION WHEN OTHERS THEN
  -- Si algo falla, PostgreSQL hace ROLLBACK automático de todo el bloque
  RAISE EXCEPTION 'Error en la migración (orden %): %', v_count + 1, SQLERRM;
END;
$$;