CREATE OR REPLACE FUNCTION public.create_simple_order(
  p_order_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  -- ==========================================
  -- IDENTIFICADORES
  -- ==========================================

  v_order_id UUID;
  v_tenant_id UUID;
  v_funcionario_id UUID;
  v_vehicle_id UUID;
  v_id_reprobado UUID;

  -- ==========================================
  -- DATOS DE LA ORDEN
  -- ==========================================

  v_placa TEXT;
  v_service_type TEXT;
  v_estado_orden TEXT;

  v_es_reinspeccion BOOLEAN;
  v_informacion_buscada BOOLEAN;

  -- ==========================================
  -- VARIABLES DE CONTROL
  -- ==========================================

 
v_consecutivo integer;

-- Datos del funcionario para los snapshots
v_func_tipo_doc text;
v_func_num_doc text;
v_func_nombre text;

v_has_permission BOOLEAN;
v_has_active_order BOOLEAN;


BEGIN



  -- ==========================================
  -- 1. VALIDAR PAYLOAD
  -- ==========================================

  IF p_order_data IS NULL
     OR jsonb_typeof(p_order_data) <> 'object' THEN
    RAISE EXCEPTION 'Los datos de la orden no son válidos.';
  END IF;


  -- ==========================================
  -- 2. EXTRAER IDENTIFICADORES
  -- ==========================================

  v_order_id :=
    NULLIF(p_order_data->>'id', '')::UUID;

  v_tenant_id :=
    NULLIF(p_order_data->>'tenant_id', '')::UUID;

  v_funcionario_id :=
    NULLIF(p_order_data->>'funcionario_id', '')::UUID;

  v_id_reprobado :=
    NULLIF(p_order_data->>'id_reprobado', '')::UUID;

  -- ==========================================
  -- 3. EXTRAER DATOS DE LA ORDEN
  -- ==========================================

  v_es_reinspeccion :=
    COALESCE((p_order_data->>'es_reinspeccion')::BOOLEAN, FALSE);

  v_informacion_buscada :=
    COALESCE((p_order_data->>'informacion_buscada')::BOOLEAN, FALSE);

  v_service_type :=
    NULLIF(TRIM(p_order_data->>'service_type'), '');

  v_estado_orden :=
    NULLIF(TRIM(p_order_data->>'estado_orden'), '');


  -- ==========================================
  -- 4. EXTRAER DATOS DEL VEHÍCULO
  -- ==========================================

  IF jsonb_typeof(p_order_data->'vehicle') IS DISTINCT FROM 'object' THEN
  RAISE EXCEPTION 'Los datos del vehículo no son válidos.';
END IF;

  

  v_placa :=
    UPPER(
      REPLACE(
        TRIM(p_order_data->'vehicle'->>'placa'),
        ' ',
        ''
      )
    );


  -- ==========================================
  -- 5. VALIDACIONES GENERALES
  -- ==========================================

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'El tenant es obligatorio.';
  END IF;

  IF v_funcionario_id IS NULL THEN
    RAISE EXCEPTION 'El funcionario es obligatorio.';
  END IF;

  IF v_service_type IS NULL THEN
    RAISE EXCEPTION 'El tipo de servicio es obligatorio.';
  END IF;

  IF v_estado_orden IS NULL THEN
    RAISE EXCEPTION 'El estado de la orden es obligatorio.';
  END IF;

  IF v_placa IS NULL OR v_placa = '' THEN
    RAISE EXCEPTION 'La placa del vehículo es obligatoria.';
  END IF;


  -- ==========================================
  -- 6. VALIDACIONES DE REINSPECCIÓN
  -- ==========================================

  IF v_es_reinspeccion AND v_id_reprobado IS NULL THEN
    RAISE EXCEPTION
      'Debe indicar la orden anterior para registrar una reinspección.';
  END IF;

  IF NOT v_es_reinspeccion AND v_id_reprobado IS NOT NULL THEN
    RAISE EXCEPTION
      'No se puede indicar una orden reprobada si no es una reinspección.';
  END IF;


  -- ==========================================
  -- 7. VALIDAR PERMISOS DEL TENANT
  -- ==========================================

    SELECT EXISTS (
        SELECT 1 
        FROM public.tenant_permissions
        WHERE tenant_id = v_tenant_id 
          AND service_user_id = v_funcionario_id
    ) INTO v_has_permission;

    IF NOT v_has_permission THEN
        RAISE EXCEPTION 'Acceso Denegado: El funcionario no cuenta con un rol o permisos asignados para el Tenant %', v_tenant_id;
    END IF;


  -- ==========================================
  -- 8. VALIDAR ORDEN ACTIVA DUPLICADA
  -- ==========================================

  SELECT EXISTS (
    SELECT 1
    FROM public.entry_orders
    WHERE tenant_id = v_tenant_id
      AND vehiculo_placa_snapshot = v_placa
      AND estado_orden IN (
        'abierta'::public.order_status_enum,
        'en_prueba'::public.order_status_enum
      )
      AND deleted_at IS NULL
      AND (v_order_id IS NULL OR id != v_order_id)
) INTO v_has_active_order;

IF v_has_active_order THEN
    RAISE EXCEPTION
      'Operación cancelada: El vehículo con placa % ya cuenta con una orden de entrada activa (Abierta o En Prueba) en este centro.',
      v_placa;
END IF;


  -- ==========================================
  -- 9. VALIDAR ORDEN DE REINSPECCIÓN
  -- ==========================================

  IF v_es_reinspeccion THEN

    IF NOT EXISTS (
    SELECT 1
    FROM public.entry_orders
    WHERE id = v_id_reprobado
      AND tenant_id = v_tenant_id
      AND deleted_at IS NULL
      AND resultado_revision = 'rechazado' -- ✅ Consultamos el campo correcto
      AND (v_order_id IS NULL OR id <> v_order_id)
  ) THEN
    RAISE EXCEPTION
      'La orden original de reinspección no existe, no pertenece a este centro, no está rechazada o no está disponible.';
  END IF;

END IF;


  -- ==========================================
  -- 10. VALIDAR CAMPOS OBLIGATORIOS DEL VEHÍCULO
  -- ==========================================

  IF NULLIF(TRIM(p_order_data->'vehicle'->>'marca'), '') IS NULL THEN
    RAISE EXCEPTION 'La marca del vehículo es obligatoria.';
  END IF;

  IF NULLIF(TRIM(p_order_data->'vehicle'->>'linea'), '') IS NULL THEN
    RAISE EXCEPTION 'La línea del vehículo es obligatoria.';
  END IF;

  IF NULLIF(TRIM(p_order_data->'vehicle'->>'modelo'), '') IS NULL THEN
    RAISE EXCEPTION 'El modelo del vehículo es obligatorio.';
  END IF;

  IF NULLIF(TRIM(p_order_data->'vehicle'->>'tipo_vehiculo'), '') IS NULL THEN
    RAISE EXCEPTION 'El tipo de vehículo es obligatorio.';
  END IF;

  IF NULLIF(TRIM(p_order_data->'vehicle'->>'clase'), '') IS NULL THEN
    RAISE EXCEPTION 'La clase del vehículo es obligatoria.';
  END IF;

  IF NULLIF(TRIM(p_order_data->'vehicle'->>'combustible'), '') IS NULL THEN
    RAISE EXCEPTION 'El combustible del vehículo es obligatorio.';
  END IF;

  IF NULLIF(TRIM(p_order_data->'vehicle'->>'tipo_servicio_vehiculo'), '') IS NULL THEN
    RAISE EXCEPTION 'El tipo de servicio del vehículo es obligatorio.';
  END IF;


    -- ==========================================
  -- 11. VALIDAR ENUMS
  -- ==========================================

  -- Tipo de servicio de la orden
  BEGIN
    PERFORM v_service_type::public.service_type_enum;
  EXCEPTION WHEN invalid_text_representation THEN
    RAISE EXCEPTION 'El tipo de servicio de la orden no es válido: %', v_service_type;
  END;

  -- Estado de la orden
  BEGIN
    PERFORM v_estado_orden::public.order_status_enum;
  EXCEPTION WHEN invalid_text_representation THEN
    RAISE EXCEPTION 'El estado de la orden no es válido: %', v_estado_orden;
  END;

  -- Tipo de vehículo
  BEGIN
    PERFORM (p_order_data->'vehicle'->>'tipo_vehiculo')::public.vehicle_type_enum;
  EXCEPTION WHEN invalid_text_representation THEN
    RAISE EXCEPTION 'El tipo de vehículo no es válido.';
  END;

  -- Clase del vehículo
  BEGIN
    PERFORM (p_order_data->'vehicle'->>'clase')::public.vehicle_class_enum;
  EXCEPTION WHEN invalid_text_representation THEN
    RAISE EXCEPTION 'La clase del vehículo no es válida.';
  END;

  -- Combustible
  BEGIN
    PERFORM (p_order_data->'vehicle'->>'combustible')::public.fuel_type_enum;
  EXCEPTION WHEN invalid_text_representation THEN
    RAISE EXCEPTION 'El tipo de combustible no es válido.';
  END;

  -- Tipo de servicio del vehículo
  BEGIN
    PERFORM (p_order_data->'vehicle'->>'tipo_servicio_vehiculo')::public.vehicle_service_type_enum;
  EXCEPTION WHEN invalid_text_representation THEN
    RAISE EXCEPTION 'El tipo de servicio del vehículo no es válido.';
  END;

-- ==========================================
-- 12. CÁLCULO DEL CONSECUTIVO POR TENANT (Solo en Creación)
-- ==========================================

-- Si el ID ya existe, debe pertenecer al tenant recibido.
IF v_order_id IS NOT NULL AND EXISTS (
    SELECT 1
    FROM public.entry_orders
    WHERE id = v_order_id
      AND tenant_id <> v_tenant_id
) THEN
    RAISE EXCEPTION 'La orden no existe o no pertenece a este centro.';
END IF;


-- Si el ID existe dentro del tenant, conservar su consecutivo.
IF v_order_id IS NOT NULL AND EXISTS (
    SELECT 1
    FROM public.entry_orders
    WHERE id = v_order_id
      AND tenant_id = v_tenant_id
) THEN

    SELECT consecutivo
    INTO v_consecutivo
    FROM public.entry_orders
    WHERE id = v_order_id
      AND tenant_id = v_tenant_id;

-- De lo contrario, calcular el siguiente consecutivo del tenant.
ELSE

    SELECT COALESCE(MAX(consecutivo), 0) + 1
    INTO v_consecutivo
    FROM public.entry_orders
    WHERE tenant_id = v_tenant_id;

END IF;

    -- =========================================================
-- OBTENER DATOS DEL FUNCIONARIO DESDE SERVICE_USERS
-- =========================================================

SELECT
    COALESCE(document_type, 'cedula'),
    COALESCE(document_number, '00000000'),
    COALESCE(full_name, 'Funcionario no registrado')
INTO
    v_func_tipo_doc,
    v_func_num_doc,
    v_func_nombre
FROM public.service_users
WHERE id = v_funcionario_id;

  -- ==========================================
  -- 13. insercion de datos
  -- ==========================================

-- =========================================================
-- PROCESO E IDENTIFICACIÓN DEL VEHÍCULO
-- =========================================================

IF v_informacion_buscada THEN

-- Validar color
IF NULLIF(TRIM(p_order_data->'vehicle'->>'color'), '') IS NULL THEN
    RAISE EXCEPTION 'El color del vehículo es obligatorio cuando se registra su información completa.';
END IF;

-- Validar cilindrada
IF NULLIF(TRIM(p_order_data->'vehicle'->>'cilindrada'), '') IS NULL THEN
    RAISE EXCEPTION 'La cilindrada del vehículo es obligatoria cuando se registra su información completa.';
END IF;

-- Validar capacidad de pasajeros
IF NULLIF(TRIM(p_order_data->'vehicle'->>'capacidad_pasajeros'), '') IS NULL THEN
    RAISE EXCEPTION 'La capacidad de pasajeros del vehículo es obligatoria cuando se registra su información completa.';
END IF;

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
        v_placa,
        p_order_data->'vehicle'->>'marca',
        p_order_data->'vehicle'->>'linea',
        (p_order_data->'vehicle'->>'modelo')::integer,
        p_order_data->'vehicle'->>'color',
        (p_order_data->'vehicle'->>'tipo_vehiculo')::public.vehicle_type_enum,
        p_order_data->'vehicle'->>'clase',
        p_order_data->'vehicle'->>'combustible',
        (p_order_data->'vehicle'->>'cilindrada')::integer,
        (p_order_data->'vehicle'->>'blindaje')::boolean,
        (p_order_data->'vehicle'->>'capacidad_pasajeros')::integer,
        (p_order_data->'vehicle'->>'es_ensenanza')::boolean,
        (p_order_data->'vehicle'->>'es_extranjero')::boolean,
        (p_order_data->'vehicle'->>'tipo_servicio_vehiculo')::public.vehicle_service_type_enum,
        NULL
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
        tipo_servicio_vehiculo = EXCLUDED.tipo_servicio_vehiculo
       

    -- Recuperar el ID del vehículo insertado o actualizado.
    RETURNING id INTO v_vehicle_id;


      

ELSE

    -- No se registra ni se asocia ningún vehículo.
    v_vehicle_id := NULL;


    

END IF;

-- =========================================================
-- INSERTAR ORDEN DE ENTRADA
-- =========================================================

INSERT INTO public.entry_orders (
    id,
    tenant_id,
    consecutivo,
    vehiculo_id,
   
    funcionario_id,
   
    es_reinspeccion,
    estado_orden,
    service_type,
    soat_vencimiento_snapshot,
    id_reprobado,

    -- Snapshots del vehículo
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

    -- Snapshots del funcionario
    funcionario_tipo_documento_snapshot,
    funcionario_numero_documento_snapshot,
    funcionario_nombre_snapshot
)
VALUES (
    COALESCE(v_order_id, gen_random_uuid()),
    v_tenant_id,
    v_consecutivo,
    v_vehicle_id,
    v_funcionario_id,
    v_es_reinspeccion,
    v_estado_orden::public.order_status_enum,
    v_service_type::public.service_type_enum,
    NULLIF(p_order_data->>'soat_vencimiento_snapshot', '')::DATE,
    v_id_reprobado,

    -- Snapshots del vehículo: siempre desde el JSON
    v_placa,
    NULLIF(TRIM(p_order_data->'vehicle'->>'marca'), ''),
    NULLIF(TRIM(p_order_data->'vehicle'->>'linea'), ''),
    NULLIF(p_order_data->'vehicle'->>'modelo', '')::INTEGER,
    NULLIF(TRIM(p_order_data->'vehicle'->>'color'), ''),
    NULLIF(p_order_data->'vehicle'->>'tipo_vehiculo', '')::public.vehicle_type_enum,
    NULLIF(TRIM(p_order_data->'vehicle'->>'clase'), ''),
    NULLIF(p_order_data->'vehicle'->>'combustible', ''),
    NULLIF(p_order_data->'vehicle'->>'cilindrada', '')::INTEGER,
    (p_order_data->'vehicle'->>'blindaje')::BOOLEAN,
    NULLIF(p_order_data->'vehicle'->>'capacidad_pasajeros', '')::INTEGER,
    (p_order_data->'vehicle'->>'es_ensenanza')::BOOLEAN,
    NULLIF(p_order_data->'vehicle'->>'tipo_servicio_vehiculo', '')::public.vehicle_service_type_enum,
    (p_order_data->'vehicle'->>'es_extranjero')::BOOLEAN,

    -- Snapshots del funcionario
    v_func_tipo_doc,
    v_func_num_doc,
    v_func_nombre
)
ON CONFLICT (id) DO UPDATE SET
    -- Relaciones de la orden
    vehiculo_id = EXCLUDED.vehiculo_id,
    funcionario_id = EXCLUDED.funcionario_id,
   

    -- Información administrativa
    es_reinspeccion = EXCLUDED.es_reinspeccion,
    estado_orden = EXCLUDED.estado_orden,
    service_type = EXCLUDED.service_type,
    id_reprobado = EXCLUDED.id_reprobado,

    -- Información del SOAT
    soat_vencimiento_snapshot = EXCLUDED.soat_vencimiento_snapshot,

    -- Snapshot del vehículo
    vehiculo_placa_snapshot = EXCLUDED.vehiculo_placa_snapshot,
    vehiculo_marca_snapshot = EXCLUDED.vehiculo_marca_snapshot,
    vehiculo_linea_snapshot = EXCLUDED.vehiculo_linea_snapshot,
    vehiculo_modelo_snapshot = EXCLUDED.vehiculo_modelo_snapshot,
    vehiculo_color_snapshot = COALESCE(
    EXCLUDED.vehiculo_color_snapshot,
    public.entry_orders.vehiculo_color_snapshot
),
    vehiculo_tipo_snapshot = EXCLUDED.vehiculo_tipo_snapshot,
    vehiculo_clase_snapshot = EXCLUDED.vehiculo_clase_snapshot,
    vehiculo_combustible_snapshot = EXCLUDED.vehiculo_combustible_snapshot,
    vehiculo_cilindrada_snapshot = COALESCE(
    EXCLUDED.vehiculo_cilindrada_snapshot,
    public.entry_orders.vehiculo_cilindrada_snapshot
),
    vehiculo_blindaje_snapshot = EXCLUDED.vehiculo_blindaje_snapshot,
    vehiculo_capacidad_pasajeros_snapshot = COALESCE(
    EXCLUDED.vehiculo_capacidad_pasajeros_snapshot,
    public.entry_orders.vehiculo_capacidad_pasajeros_snapshot
),
    vehiculo_es_ensenanza_snapshot = EXCLUDED.vehiculo_es_ensenanza_snapshot,
    vehiculo_tipo_servicio_snapshot = EXCLUDED.vehiculo_tipo_servicio_snapshot,
    vehiculo_es_extranjero_snapshot = EXCLUDED.vehiculo_es_extranjero_snapshot,

   

    -- Snapshot del funcionario
    funcionario_tipo_documento_snapshot = EXCLUDED.funcionario_tipo_documento_snapshot,
    funcionario_numero_documento_snapshot = EXCLUDED.funcionario_numero_documento_snapshot,
    funcionario_nombre_snapshot = EXCLUDED.funcionario_nombre_snapshot,

    -- Actualización
    updated_at = NOW()
RETURNING id INTO v_order_id;




  RETURN jsonb_build_object(
    'success', TRUE,
    'message', 'Validaciones completadas.',
    'order_id', v_order_id
  );

END;
$$;