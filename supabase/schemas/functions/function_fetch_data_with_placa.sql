CREATE OR REPLACE FUNCTION fetch_data_with_placa(
    p_placa TEXT,
    p_tenant_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_vehicle_row RECORD;
    v_owner_json JSONB;
    v_result JSONB;
BEGIN
    -- 1. Buscar el vehículo
    SELECT * INTO v_vehicle_row
    FROM public.vehicles v
    WHERE UPPER(TRIM(v.placa)) = UPPER(TRIM(p_placa))
      AND v.tenant_id = p_tenant_id
      AND v.deleted_at IS NULL
    LIMIT 1;

    -- 2. Si NO existe el vehículo, retornamos NULL plano e inmediato
    IF v_vehicle_row.id IS NULL THEN
        RETURN NULL;
    END IF;

    -- 3. Si existe, buscamos los datos del propietario actual en la tabla personas
    IF v_vehicle_row.propietario_actual_id IS NOT NULL THEN
        SELECT jsonb_build_object(
            'id', p.id,
            'tipo_documento', p.tipo_documento,
            'numero_documento', p.numero_documento,
            'nombre_completo', p.nombre_completo,
            'telefono', p.telefono,
            'correo', p.correo,
            'direccion', p.direccion
        ) INTO v_owner_json
        FROM public.personas p
        WHERE p.id = v_vehicle_row.propietario_actual_id;
    ELSE
        v_owner_json := NULL;
    END IF;

    -- 4. Construimos el objeto unificado de salida (Fase Propietario)
    v_result := jsonb_build_object(
        'vehicle', jsonb_build_object(
            'id', v_vehicle_row.id,
            'placa', v_vehicle_row.placa,
            'marca', v_vehicle_row.marca,
            'linea', v_vehicle_row.linea,
            'modelo', v_vehicle_row.modelo,
            'color', v_vehicle_row.color,
            'tipo_vehiculo', v_vehicle_row.tipo_vehiculo,
            'clase', v_vehicle_row.clase,
            'combustible', v_vehicle_row.combustible,
            'cilindrada', v_vehicle_row.cilindrada,
            'blindaje', v_vehicle_row.blindaje,
            'capacidad_pasajeros', v_vehicle_row.capacidad_pasajeros,
            'es_ensenanza', v_vehicle_row.es_ensenanza,
            'tipo_servicio_vehiculo', v_vehicle_row.tipo_servicio_vehiculo,
            'propietario_actual_id', v_vehicle_row.propietario_actual_id,
            'es_extranjero', v_vehicle_row.es_extranjero
        ),
        'owner_data', v_owner_json,
        -- Dejamos estos listos en la recámara para la consulta de la última orden:
        'customer_data', NULL,
        'is_owner_same_as_customer', FALSE
    );

    RETURN v_result;
END;
$$;