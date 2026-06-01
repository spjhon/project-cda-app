

-- 1. CREACIÓN DE LA FUNCIÓN MAESTRA CON BLINDAJE TOTAL ANTI-NULL
CREATE OR REPLACE FUNCTION public.create_full_order(p_data jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_order_id uuid;
    v_tenant_id uuid;
    v_input_id uuid;
    v_consecutivo integer;
    
    -- Variables para almacenar los IDs de las relaciones
    v_propietario_id uuid;
    v_cliente_id uuid;
    v_vehiculo_id uuid;
    
    -- Atajos para navegar los objetos anidados del JSONB
    v_vehicle_json jsonb;
    v_customer_json jsonb;
    v_owner_json jsonb;
    v_conditions_json jsonb;
    v_signatures_json jsonb;
BEGIN
    -- =========================================================================
    -- PASO 0: INICIALIZACIÓN DE VARIABLES Y ATAJOS
    -- =========================================================================
    v_tenant_id := (p_data->>'tenant_id')::uuid;
    v_input_id := (p_data->>'id')::uuid; 
    v_vehicle_json := p_data->'vehicle';
    v_customer_json := p_data->'customer_data';
    v_owner_json := p_data->'owner_data';
    v_conditions_json := p_data->'condition_results';
    v_signatures_json := p_data->'signatures';


    -- =========================================================================
    -- PASO 0.1: CÁLCULO DEL CONSECUTIVO POR TENANT (Solo en Creación)
    -- =========================================================================
    --Si el id no es null y se encuentra presente, entonces asignar a la variable v_consecutivo el consecutivo que ya existia.
    IF v_input_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.entry_orders WHERE id = v_input_id) THEN
        SELECT consecutivo INTO v_consecutivo FROM public.entry_orders WHERE id = v_input_id;
        --de lo contrario coger el maximo del consecutivo que ya existe, sumarle uno y mandarlo a la insercion de la columna correspondiente
    ELSE
        SELECT COALESCE(MAX(consecutivo), 0) + 1 
        INTO v_consecutivo 
        FROM public.entry_orders 
        WHERE tenant_id = v_tenant_id;
    END IF;


    -- =========================================================================
    -- PASO 1: PROCESO DEL CLIENTE (customer_data)
    -- =========================================================================
    INSERT INTO public.personas (
        tenant_id,
        tipo_documento,
        numero_documento,
        nombre_completo,
        telefono,
        correo,
        direccion
    )
    VALUES (
        v_tenant_id,
        (v_customer_json->>'tipo_documento')::public.document_type_enum,
        (v_customer_json->>'numero_documento'),
        (v_customer_json->>'nombre_completo'),
        NULLIF(v_customer_json->>'telefono', ''),
        NULLIF(v_customer_json->>'correo', ''),
        NULLIF(v_customer_json->>'direccion', '')
    )
    --si hay un conflicto con esactamente esos tres valores, entonces ejecutar el update
    ON CONFLICT (tenant_id, tipo_documento, numero_documento) 
    DO UPDATE SET
        nombre_completo = EXCLUDED.nombre_completo,
        telefono = EXCLUDED.telefono,
        correo = EXCLUDED.correo,
        direccion = EXCLUDED.direccion;
    -- Quitamos el RETURNING directo de este bloque para evitar el bug del NULL y lo rescatamos con SELECT seguro:
    --seleccionamos el id directamente por medio de un select con las condiciones aqui presentes
    SELECT id INTO v_cliente_id 
    FROM public.personas 
    WHERE tenant_id = v_tenant_id 
      AND tipo_documento = (v_customer_json->>'tipo_documento')::public.document_type_enum 
      AND numero_documento = (v_customer_json->>'numero_documento');


    -- =========================================================================
    -- PASO 2: PROCESO DEL PROPIETARIO (owner_data)
    -- =========================================================================
    INSERT INTO public.personas (
        tenant_id,
        tipo_documento,
        numero_documento,
        nombre_completo,
        telefono,
        correo,
        direccion
    )
    VALUES (
        v_tenant_id,
        (v_owner_json->>'tipo_documento')::public.document_type_enum,
        (v_owner_json->>'numero_documento'),
        (v_owner_json->>'nombre_completo'),
        NULLIF(v_owner_json->>'telefono', ''),
        NULLIF(v_owner_json->>'correo', ''),
        NULLIF(v_owner_json->>'direccion', '')
    )
    ON CONFLICT (tenant_id, tipo_documento, numero_documento) 
    DO UPDATE SET
        nombre_completo = EXCLUDED.nombre_completo,
        telefono = EXCLUDED.telefono,
        correo = EXCLUDED.correo,
        direccion = EXCLUDED.direccion;
    -- Rescate seguro del ID del propietario por su llave única:

    SELECT id INTO v_propietario_id 
    FROM public.personas 
    WHERE tenant_id = v_tenant_id 
      AND tipo_documento = (v_owner_json->>'tipo_documento')::public.document_type_enum 
      AND numero_documento = (v_owner_json->>'numero_documento');


    -- =========================================================================
    -- PASO 3: PROCESO DEL VEHÍCULO
    -- =========================================================================
    INSERT INTO public.vehicles (
        tenant_id,
        placa,
        marca,
        linea,
        modelo,
        color,
        tipo_vehiculo,
        clase,
        combustible,
        cilindrada, 
        blindaje,
        capacidad_pasajeros,
        es_ensenanza,
        es_extranjero,
        tipo_servicio_vehiculo,
        propietario_actual_id
    )
    VALUES (
        v_tenant_id,
        UPPER(v_vehicle_json->>'placa'),
        (v_vehicle_json->>'marca'),
        (v_vehicle_json->>'linea'),
        (v_vehicle_json->>'modelo')::integer,
        (v_vehicle_json->>'color'),
        (v_vehicle_json->>'tipo_vehiculo')::public.vehicle_type_enum,
        (v_vehicle_json->>'clase'),
        (v_vehicle_json->>'combustible'),
        (v_vehicle_json->>'cilindrada')::integer, 
        (v_vehicle_json->>'blindaje')::boolean,
        (v_vehicle_json->>'capacidad_pasajeros')::integer,
        (v_vehicle_json->>'es_ensenanza')::boolean,
        (v_vehicle_json->>'es_extranjero')::boolean,
        (v_vehicle_json->>'tipo_servicio_vehiculo')::public.vehicle_service_type_enum,
        v_propietario_id -- Pasa el v_propietario_id rescatado limpiamente arriba
    )
    ON CONFLICT (tenant_id, placa) 
    DO UPDATE SET
        marca = EXCLUDED.marca,
        linea = EXCLUDED.linea,
        modelo = EXCLUDED.modelo,
        color = EXCLUDED.color,
        tipo_vehiculo = EXCLUDED.tipo_vehiculo,
        clase = EXCLUDED.clase,
        combustible = EXCLUDED.combustible,
        cilindrada = EXCLUDED.cilindrada, 
        blindaje = EXCLUDED.blindaje,
        capacidad_pasajeros = EXCLUDED.capacidad_pasajeros,
        es_ensenanza = EXCLUDED.es_ensenanza,
        es_extranjero = EXCLUDED.es_extranjero,
        tipo_servicio_vehiculo = EXCLUDED.tipo_servicio_vehiculo,
        propietario_actual_id = EXCLUDED.propietario_actual_id;
    -- Rescate seguro del ID del vehículo por su llave única:

    SELECT id INTO v_vehiculo_id 
    FROM public.vehicles 
    WHERE tenant_id = v_tenant_id 
      AND placa = UPPER(v_vehicle_json->>'placa');


    -- =========================================================================
    -- PASO 4: PROCESO DE LA ORDEN DE ENTRADA (Con todas las variables garantizadas)
    -- =========================================================================
    INSERT INTO public.entry_orders (
        id,
        tenant_id,
        consecutivo,
        vehiculo_id,
        propietario_id,
        cliente_id,
        funcionario_id,
        plantilla_id,
        kilometraje,
        es_reinspeccion,
        observaciones,
        estado_orden,
        soat_vencimiento_snapshot,
        gas_numero_snapshot,
        gas_vencimiento_snapshot,
        texto_contractual_snapshot,
        service_type
    )
    VALUES (
        COALESCE(v_input_id, gen_random_uuid()),
        v_tenant_id,
        v_consecutivo,
        v_vehiculo_id,    -- Real, asegurado por el SELECT previo
        v_propietario_id, -- Real, asegurado por el SELECT previo
        v_cliente_id,     -- Real, asegurado por el SELECT previo
        (p_data->>'funcionario_id')::uuid,
        (p_data->>'plantilla_id')::uuid,
        (p_data->>'kilometraje'),
        COALESCE((p_data->>'es_reinspeccion')::boolean, false),
        (p_data->>'observaciones'),
        COALESCE((p_data->>'estado_orden')::public.order_status_enum, 'abierta'::public.order_status_enum),
        
        NULLIF(p_data->>'soat_vencimiento_snapshot', '')::date,
        (p_data->>'gas_numero_snapshot'),
        NULLIF(p_data->>'gas_vencimiento_snapshot', '')::date,
        
        (p_data->>'texto_contractual_snapshot'),
        COALESCE((p_data->>'service_type')::public.service_type_enum, 'RTM'::public.service_type_enum)
    )
    ON CONFLICT (id) 
    DO UPDATE SET
        vehiculo_id = EXCLUDED.vehiculo_id,
        propietario_id = EXCLUDED.propietario_id,
        cliente_id = EXCLUDED.cliente_id,
        funcionario_id = EXCLUDED.funcionario_id,
        kilometraje = EXCLUDED.kilometraje,
        es_reinspeccion = EXCLUDED.es_reinspeccion,
        observaciones = EXCLUDED.observaciones,
        estado_orden = EXCLUDED.estado_orden,
        soat_vencimiento_snapshot = EXCLUDED.soat_vencimiento_snapshot,
        gas_numero_snapshot = EXCLUDED.gas_numero_snapshot,
        gas_vencimiento_snapshot = EXCLUDED.gas_vencimiento_snapshot,
        texto_contractual_snapshot = EXCLUDED.texto_contractual_snapshot,
        service_type = EXCLUDED.service_type
    RETURNING id INTO v_order_id;


    -- =========================================================================
    -- PASO 5: PROCESO DETALLE - PRESIONES DE LLANTAS (tire_pressures)
    -- =========================================================================
    DELETE FROM public.entry_order_tire_pressures 
    WHERE entry_order_id = v_order_id;

    INSERT INTO public.entry_order_tire_pressures (
        tenant_id,
        entry_order_id,
        eje,
        posicion,
        presion_encontrada,
        presion_ajustada
    )
    SELECT 
        v_tenant_id,
        v_order_id,
        t.eje,
        t.posicion,
        NULLIF(t.presion_encontrada, '')::numeric,
        NULLIF(t.presion_ajustada, '')::numeric
    FROM jsonb_to_recordset(p_data->'tire_pressures') AS t(
        eje integer,
        posicion character varying,
        presion_encontrada character varying,
        presion_ajustada character varying
    );

    
    -- =========================================================================
    -- PASO 6: PROCESO DETALLE - CONDICIONES DE RECEPCIÓN (conditions - Masivo)
    -- =========================================================================
    -- En caso de edición, limpiamos los resultados previos para esta orden
    DELETE FROM public.order_condition_results 
    WHERE entry_order_id = v_order_id;

    -- Inserción masiva transformando el arreglo JSON en registros SQL reales
    INSERT INTO public.order_condition_results (
        tenant_id,
        entry_order_id,
        template_condition_id,
        value
    )
    SELECT 
        v_tenant_id,
        v_order_id,
        c.template_condition_id,
        c.value::public.condition_response_enum
    FROM jsonb_to_recordset(v_conditions_json) AS c(
        template_condition_id uuid,
        value character varying
    );


-- =========================================================================
    -- ➕ PASO 7: PROCESO DETALLE - FIRMAS DE LA ORDEN (signatures - Masivo)
    -- =========================================================================
    -- En caso de edición, limpiamos las firmas previas de esta orden
    DELETE FROM public.order_signatures 
    WHERE entry_order_id = v_order_id;

    -- Inserción masiva transformando el arreglo de firmas en registros reales
    INSERT INTO public.order_signatures (
        tenant_id,
        entry_order_id,
        template_signature_id,
        signature_url
    )
    SELECT 
        v_tenant_id,
        v_order_id,
        s.template_signature_id,
        s.signature_url
    FROM jsonb_to_recordset(v_signatures_json) AS s(
        template_signature_id uuid,
        signature_url text
    );


RETURN v_order_id;


END;
$$;