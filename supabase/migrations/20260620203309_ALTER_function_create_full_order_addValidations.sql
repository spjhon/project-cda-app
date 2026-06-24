CREATE OR REPLACE FUNCTION public.create_full_order(p_data jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_order_id uuid;
    v_tenant_id uuid;
    v_input_id uuid;
    v_consecutivo integer;
    
    -- Variables para almacenar los IDs de las relaciones primarias
    v_propietario_id uuid;
    v_cliente_id uuid;
    v_vehiculo_id uuid;
    
    -- Variables temporales calibradas con la estructura real de public.service_users
    v_func_tipo_doc text;
    v_func_num_doc text;
    v_func_nombre text;
    v_func_firma text;
    
    -- Atajos para navegar los objetos anidados del JSONB payload
    v_vehicle_json jsonb;
    v_customer_json jsonb;
    v_owner_json jsonb;
    v_conditions_json jsonb;
    v_signatures_json jsonb;

    -- Variable de seguridad para verificar permisos en el tenant
    v_has_permission boolean;
    
    -- Variable para verificar si el vehículo ya tiene una orden activa
    v_has_active_order boolean;
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
    -- PASO 0.1: VALIDACIÓN DE SEGURIDAD Y PERMISOS EN EL TENANT
    -- =========================================================================
    SELECT EXISTS (
        SELECT 1 
        FROM public.tenant_permissions
        WHERE tenant_id = v_tenant_id 
          AND service_user_id = (p_data->>'funcionario_id')::uuid
    ) INTO v_has_permission;

    IF NOT v_has_permission THEN
        RAISE EXCEPTION 'Acceso Denegado: El funcionario no cuenta con un rol o permisos asignados para el Tenant %', v_tenant_id;
    END IF;



-- =========================================================================
    -- PASO 0.2: VALIDACIÓN DE ÓRDENES ACTIVAS O EN PROCESO (Inspección / Reinspección)
    -- =========================================================================
    SELECT EXISTS (
        SELECT 1 
        FROM public.entry_orders
        WHERE tenant_id = v_tenant_id
          AND vehiculo_placa_snapshot = UPPER(v_vehicle_json->>'placa')
          AND estado_orden IN ('abierta'::public.order_status_enum, 'en_prueba'::public.order_status_enum)
          AND deleted_at IS NULL
          -- Si estamos EDITANDO la orden, ignoramos la orden misma que se está editando
          AND (v_input_id IS NULL OR id != v_input_id)
    ) INTO v_has_active_order;

    IF v_has_active_order THEN
        RAISE EXCEPTION 'Operación cancelada: El vehículo con placa % ya cuenta con una orden de entrada activa (Abierta o En Prueba) en este centro.', UPPER(v_vehicle_json->>'placa');
    END IF;


    -- =========================================================================
    -- PASO 0.3: CÁLCULO DEL CONSECUTIVO POR TENANT (Solo en Creación)
    -- =========================================================================
--Si el id no es null y se encuentra presente, entonces asignar a la variable v_consecutivo el consecutivo que ya existia.
    IF v_input_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.entry_orders WHERE id = v_input_id) THEN
        SELECT consecutivo INTO v_consecutivo FROM public.entry_orders WHERE id = v_input_id;
--de lo contrario coger el maximo del consecutivo que ya existe, sumarle uno y mandarlo a la insercion de la columna correspondiente0
    ELSE
        SELECT COALESCE(MAX(consecutivo), 0) + 1 
        INTO v_consecutivo 
        FROM public.entry_orders 
        WHERE tenant_id = v_tenant_id;
    END IF;



    -- =========================================================================
    -- PASO 1: PROCESO E IDENTIFICACIÓN DEL CLIENTE (customer_data)
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

    SELECT id INTO v_cliente_id 
    FROM public.personas 
    WHERE tenant_id = v_tenant_id 
      AND tipo_documento = (v_customer_json->>'tipo_documento')::public.document_type_enum 
      AND numero_documento = (v_customer_json->>'numero_documento');

    -- =========================================================================
    -- PASO 2: PROCESO E IDENTIFICACIÓN DEL PROPIETARIO (owner_data)
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

    SELECT id INTO v_propietario_id 
    FROM public.personas 
    WHERE tenant_id = v_tenant_id 
      AND tipo_documento = (v_owner_json->>'tipo_documento')::public.document_type_enum 
      AND numero_documento = (v_owner_json->>'numero_documento');

    -- =========================================================================
    -- PASO 3: PROCESO E IDENTIFICACIÓN DEL VEHÍCULO
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
        COALESCE((v_vehicle_json->>'blindaje')::boolean, false),
        (v_vehicle_json->>'capacidad_pasajeros')::integer,
        COALESCE((v_vehicle_json->>'es_ensenanza')::boolean, false),
        COALESCE((v_vehicle_json->>'es_extranjero')::boolean, false),
        COALESCE((v_vehicle_json->>'tipo_servicio_vehiculo')::public.vehicle_service_type_enum, 'particular'::public.vehicle_service_type_enum),
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
    -- PASO 3.1: OBTENER DATOS DESDE SERVICE_USERS (Firma obligatoria de la tabla)
    -- =========================================================================
    SELECT 
        COALESCE(document_type, 'cedula'), 
        COALESCE(document_number, '00000000'), 
        COALESCE(full_name, 'Funcionario no registrado'),
        COALESCE(signature_base64, '') -- Extrae la firma de la tabla. Si está vacía, devuelve ''
    INTO v_func_tipo_doc, v_func_num_doc, v_func_nombre, v_func_firma
    FROM public.service_users 
    WHERE id = (p_data->>'funcionario_id')::uuid;

    -- =========================================================================
    -- PASO 4: PROCESO DE LA ORDEN DE ENTRADA CON MAPEO MASIVO DE SNAPSHOTS
    -- =========================================================================
    INSERT INTO public.entry_orders (
        id,
        tenant_id,
        vehiculo_id,
        propietario_id,
        cliente_id,
        funcionario_id,
        plantilla_id,
        consecutivo,
        es_reinspeccion,
        service_type,
        estado_orden,
        kilometraje,
        observaciones,

        -- Snapshots del Vehículo
        vehiculo_placa_snapshot,
        vehiculo_marca_snapshot,
        vehiculo_linea_snapshot,
        vehiculo_modelo_snapshot,
        vehiculo_color_snapshot,
        vehiculo_tipo_snapshot,
        vehiculo_clase_snapshot,
        vehiculo_combustible_snapshot,
        vehiculo_cilindrada_snapshot,
        vehiculo_blindaje_snapshot,
        vehiculo_capacidad_pasajeros_snapshot,
        vehiculo_es_ensenanza_snapshot,
        vehiculo_tipo_servicio_snapshot,
        vehiculo_es_extranjero_snapshot,

        -- Snapshots del Propietario
        propietario_tipo_documento_snapshot,
        propietario_numero_documento_snapshot,
        propietario_nombre_snapshot,
        propietario_telefono_snapshot,
        propietario_email_snapshot,
        propietario_direccion_snapshot,

        -- Snapshots del Cliente
        cliente_tipo_documento_snapshot,
        cliente_numero_documento_snapshot,
        cliente_nombre_snapshot,
        cliente_telefono_snapshot,
        cliente_email_snapshot,
        cliente_direccion_snapshot,

        -- Snapshots del Funcionario
        funcionario_tipo_documento_snapshot,
        funcionario_numero_documento_snapshot,
        funcionario_nombre_snapshot,
        funcionario_firma_base64_snapshot,

        -- Snapshots Documentales
        soat_vencimiento_snapshot,
        gas_numero_snapshot,
        gas_vencimiento_snapshot
        
        
    )
    VALUES (
        COALESCE(v_input_id, gen_random_uuid()),
        v_tenant_id,
        v_vehiculo_id,
        v_propietario_id,
        v_cliente_id,
        (p_data->>'funcionario_id')::uuid,
        (p_data->>'plantilla_id')::uuid,
        v_consecutivo,
        COALESCE((p_data->>'es_reinspeccion')::boolean, false),
        COALESCE((p_data->>'service_type')::public.service_type_enum, 'RTM'::public.service_type_enum),
        COALESCE((p_data->>'estado_orden')::public.order_status_enum, 'abierta'::public.order_status_enum),
        (p_data->>'kilometraje'),
        (p_data->>'observaciones'),

        -- Mapeo Vehículo
        UPPER(v_vehicle_json->>'placa'),
        (v_vehicle_json->>'marca'),
        (v_vehicle_json->>'linea'),
        (v_vehicle_json->>'modelo')::integer,
        (v_vehicle_json->>'color'),
        (v_vehicle_json->>'tipo_vehiculo')::public.vehicle_type_enum,
        (v_vehicle_json->>'clase'),
        (v_vehicle_json->>'combustible'),
        (v_vehicle_json->>'cilindrada')::integer,
        COALESCE((v_vehicle_json->>'blindaje')::boolean, false),
        (v_vehicle_json->>'capacidad_pasajeros')::integer,
        COALESCE((v_vehicle_json->>'es_ensenanza')::boolean, false),
        COALESCE((v_vehicle_json->>'tipo_servicio_vehiculo')::public.vehicle_service_type_enum, 'particular'::public.vehicle_service_type_enum),
        COALESCE((v_vehicle_json->>'es_extranjero')::boolean, false),

        -- Mapeo Propietario
        (v_owner_json->>'tipo_documento'),
        (v_owner_json->>'numero_documento'),
        (v_owner_json->>'nombre_completo'),
        NULLIF(v_owner_json->>'telefono', ''),
        NULLIF(v_owner_json->>'correo', ''),
        NULLIF(v_owner_json->>'direccion', ''),

        -- Mapeo Cliente
        (v_customer_json->>'tipo_documento'),
        (v_customer_json->>'numero_documento'),
        (v_customer_json->>'nombre_completo'),
        NULLIF(v_customer_json->>'telefono', ''),
        NULLIF(v_customer_json->>'correo', ''),
        NULLIF(v_customer_json->>'direccion', ''),

        -- Mapeo Funcionario (Extraído estrictamente de service_users)
        v_func_tipo_doc,
        v_func_num_doc,
        v_func_nombre,
        v_func_firma, -- Directo de la tabla. Si no existe, viaja vacío ''

        -- Mapeo Documentos
        NULLIF(p_data->>'soat_vencimiento_snapshot', '')::date,
        (p_data->>'gas_numero_snapshot'),
        NULLIF(p_data->>'gas_vencimiento_snapshot', '')::date
        
        
    )
    ON CONFLICT (id) 
    DO UPDATE SET
        vehiculo_id = EXCLUDED.vehiculo_id,
        propietario_id = EXCLUDED.propietario_id,
        cliente_id = EXCLUDED.cliente_id,
        funcionario_id = EXCLUDED.funcionario_id,
        plantilla_id = EXCLUDED.plantilla_id,
        es_reinspeccion = EXCLUDED.es_reinspeccion,
        service_type = EXCLUDED.service_type,
        estado_orden = EXCLUDED.estado_orden,
        kilometraje = EXCLUDED.kilometraje,
        observaciones = EXCLUDED.observaciones,

        -- Actualización de Snapshots en Edición
        vehiculo_placa_snapshot = EXCLUDED.vehiculo_placa_snapshot,
        vehiculo_marca_snapshot = EXCLUDED.vehiculo_marca_snapshot,
        vehiculo_linea_snapshot = EXCLUDED.vehiculo_linea_snapshot,
        vehiculo_modelo_snapshot = EXCLUDED.vehiculo_modelo_snapshot,
        vehiculo_color_snapshot = EXCLUDED.vehiculo_color_snapshot,
        vehiculo_tipo_snapshot = EXCLUDED.vehiculo_tipo_snapshot,
        vehiculo_clase_snapshot = EXCLUDED.vehiculo_clase_snapshot,
        vehiculo_combustible_snapshot = EXCLUDED.vehiculo_combustible_snapshot,
        vehiculo_cilindrada_snapshot = EXCLUDED.vehiculo_cilindrada_snapshot,
        vehiculo_blindaje_snapshot = EXCLUDED.vehiculo_blindaje_snapshot,
        vehiculo_capacidad_pasajeros_snapshot = EXCLUDED.vehiculo_capacidad_pasajeros_snapshot,
        vehiculo_es_ensenanza_snapshot = EXCLUDED.vehiculo_es_ensenanza_snapshot,
        vehiculo_tipo_servicio_snapshot = EXCLUDED.vehiculo_tipo_servicio_snapshot,
        vehiculo_es_extranjero_snapshot = EXCLUDED.vehiculo_es_extranjero_snapshot,

        propietario_tipo_documento_snapshot = EXCLUDED.propietario_tipo_documento_snapshot,
        propietario_numero_documento_snapshot = EXCLUDED.propietario_numero_documento_snapshot,
        propietario_nombre_snapshot = EXCLUDED.propietario_nombre_snapshot,
        propietario_telefono_snapshot = EXCLUDED.propietario_telefono_snapshot,
        propietario_email_snapshot = EXCLUDED.propietario_email_snapshot,
        propietario_direccion_snapshot = EXCLUDED.propietario_direccion_snapshot,

        cliente_tipo_documento_snapshot = EXCLUDED.cliente_tipo_documento_snapshot,
        cliente_numero_documento_snapshot = EXCLUDED.cliente_numero_documento_snapshot,
        cliente_nombre_snapshot = EXCLUDED.cliente_nombre_snapshot,
        cliente_telefono_snapshot = EXCLUDED.cliente_telefono_snapshot,
        cliente_email_snapshot = EXCLUDED.cliente_email_snapshot,
        cliente_direccion_snapshot = EXCLUDED.cliente_direccion_snapshot,

        funcionario_tipo_documento_snapshot = EXCLUDED.funcionario_tipo_documento_snapshot,
        funcionario_numero_documento_snapshot = EXCLUDED.funcionario_numero_documento_snapshot,
        funcionario_nombre_snapshot = EXCLUDED.funcionario_nombre_snapshot,
        funcionario_firma_base64_snapshot = EXCLUDED.funcionario_firma_base64_snapshot,

        soat_vencimiento_snapshot = EXCLUDED.soat_vencimiento_snapshot,
        gas_numero_snapshot = EXCLUDED.gas_numero_snapshot,
        gas_vencimiento_snapshot = EXCLUDED.gas_vencimiento_snapshot
        
        
    RETURNING id INTO v_order_id;

    -- =========================================================================
    -- PASO 5: PROCESO DETALLE - PRESIONES DE LLANTAS (tire_pressures)
    -- =========================================================================
    DELETE FROM public.entry_order_tire_pressures WHERE entry_order_id = v_order_id;

    INSERT INTO public.entry_order_tire_pressures (
        tenant_id, 
	entry_order_id, 
	eje, posicion, 
	presion_encontrada, 
	presion_ajustada
    )
    SELECT 
        v_tenant_id, 
	v_order_id, 
	t.eje, t.posicion,
        NULLIF(t.presion_encontrada, '')::numeric, 
	NULLIF(t.presion_ajustada, '')::numeric

    FROM jsonb_to_recordset(p_data->'tire_pressures') AS t(
        eje integer, 
	posicion character varying, 
	presion_encontrada character varying, 
	presion_ajustada character varying
    );
    
    -- =========================================================================
    -- PASO 6: PROCESO DETALLE - CONDICIONES DE RECEPCIÓN (conditions)
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
    -- PASO 7: PROCESO DETALLE - FIRMAS CAPTURADAS EN LA ORDEN (customer/owner signatures)
    -- =========================================================================
    DELETE FROM public.order_signatures 
	WHERE entry_order_id = v_order_id;

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