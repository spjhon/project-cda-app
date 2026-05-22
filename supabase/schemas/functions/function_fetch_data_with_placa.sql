--OJO OJO QUE TODAVIA NO SE HA HECHO LA MIGRACION


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
    v_customer_json JSONB;
    v_last_customer_id UUID; -- ⚡ Volvemos a extraer solo el UUID del cliente
    v_is_owner_same_as_customer BOOLEAN := FALSE;
    v_result JSONB;
BEGIN
    -- 1. Buscar el vehículo mediante aislamiento por tenant
    SELECT * INTO v_vehicle_row
    FROM public.vehicles v
    WHERE UPPER(TRIM(v.placa)) = UPPER(TRIM(p_placa))
      AND v.tenant_id = p_tenant_id
      AND v.deleted_at IS NULL
    LIMIT 1;

    -- 2. Si NO existe el vehículo en este CDA, retornamos NULL plano de inmediato
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

    -- 4. ✅ Buscar ÚNICAMENTE el cliente_id de la última orden de entrada para este vehículo
    SELECT o.cliente_id INTO v_last_customer_id
    FROM public.entry_orders o
    WHERE o.vehiculo_id = v_vehicle_row.id
      AND o.tenant_id = p_tenant_id
      AND o.deleted_at IS NULL
    ORDER BY o.created_at DESC
    LIMIT 1;

    -- 5. Si encontramos una orden previa, extraemos los datos de ese cliente histórico
    IF v_last_customer_id IS NOT NULL THEN
        SELECT jsonb_build_object(
            'id', p.id,
            'tipo_documento', p.tipo_documento,
            'numero_documento', p.numero_documento,
            'nombre_completo', p.nombre_completo,
            'telefono', p.telefono,
            'correo', p.correo,
            'direccion', p.direccion
        ) INTO v_customer_json
        FROM public.personas p
        WHERE p.id = v_last_customer_id;

        -- 6. Evaluamos dinámicamente si el propietario actual es el mismo cliente de la última visita
        IF v_vehicle_row.propietario_actual_id = v_last_customer_id THEN
            v_is_owner_same_as_customer := TRUE;
        END IF;
    ELSE
        v_customer_json := NULL;
    END IF;

    -- 7. ✅ Construimos el objeto unificado de salida SIN los snapshots de vencimiento
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
        'customer_data', v_customer_json,
        'is_owner_same_as_customer', v_is_owner_same_as_customer
    );

    RETURN v_result;
END;
$$;