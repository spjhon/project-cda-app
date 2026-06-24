


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."condition_response_enum" AS ENUM (
    'cumple',
    'no_cumple',
    'no_aplica'
);


ALTER TYPE "public"."condition_response_enum" OWNER TO "postgres";


CREATE TYPE "public"."document_type_enum" AS ENUM (
    'cedula_ciudadania',
    'nit',
    'nn',
    'pasaporte',
    'cedula_extranjeria',
    'tarjeta_identidad',
    'registro_civil',
    'carnet_diplomatico',
    'ti2'
);


ALTER TYPE "public"."document_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."office_payment_type_enum" AS ENUM (
    'efectivo',
    'tarjeta_debito',
    'tarjeta_credito',
    'sistecredito',
    'addi',
    'transferencia',
    'qr'
);


ALTER TYPE "public"."office_payment_type_enum" OWNER TO "postgres";


COMMENT ON TYPE "public"."office_payment_type_enum" IS 'Métodos de pago autorizados para la facturación de servicios en la caja de la oficina del CDA.
Valores permitidos:
  - efectivo: Pago con moneda corriente física.
  - tarjeta_debito: Tarjeta de débito bancaria (Mister, Visa, etc.).
  - tarjeta_credito: Tarjeta de crédito (Franquicias tradicionales).
  - sistecredito: Línea de crédito y financiamiento por plataforma Sistecrédito.
  - addi: Compra a cuotas mediante la pasarela fintech Addi.
  - transferencia: Transferencias directas verificadas (Bancolombia, Nequi, Daviplata, etc.).
  - qr: Pagos mediante códigos QR de interoperabilidad bancaria.
Este tipo es crítico para los cierres, arqueos de caja diarios y auditorías contables.';



CREATE TYPE "public"."order_status_enum" AS ENUM (
    'abierta',
    'en_prueba',
    'finalizada',
    'anulada'
);


ALTER TYPE "public"."order_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."service_type_enum" AS ENUM (
    'RTM',
    'preventiva',
    'peritaje',
    'otro'
);


ALTER TYPE "public"."service_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."user_role_enum" AS ENUM (
    'gerente',
    'recepcionista',
    'aux_administrativo',
    'director_tecnico'
);


ALTER TYPE "public"."user_role_enum" OWNER TO "postgres";


COMMENT ON TYPE "public"."user_role_enum" IS 'Roles asignados a los usuarios dentro del CDA para control de accesos (SGC / ISO 17020).';



CREATE TYPE "public"."vehicle_service_type_enum" AS ENUM (
    'particular',
    'enseñanza',
    'oficial',
    'publico',
    'diplomático',
    'especial'
);


ALTER TYPE "public"."vehicle_service_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."vehicle_type_enum" AS ENUM (
    'liviano',
    'pesado',
    'motocicleta_4t',
    'motocicleta_2t',
    'motocarro_4t',
    'motocarro_2t'
);


ALTER TYPE "public"."vehicle_type_enum" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_preventiva_reinspection_eligibility"("p_placa" character varying, "p_tenant_id" "uuid") RETURNS TABLE("merece_reinspeccion" boolean, "motivo" "text", "id_reprobado" "uuid")
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_orden_id UUID;
    v_fecha_limite DATE;
    v_conteo_originales INT;
    v_ya_reinspeccionada BOOLEAN;
BEGIN



    -- 1. Contar cuántas órdenes originales vigentes existen
    SELECT COUNT(*)
    INTO v_conteo_originales
    FROM public.entry_orders
    WHERE vehiculo_placa_snapshot = p_placa
      AND tenant_id = p_tenant_id
      AND es_reinspeccion = false
      AND service_type = 'preventiva'
      AND estado_orden = 'finalizada'
      AND resultado_revision = 'rechazado'
      AND CURRENT_DATE <= fecha_limite_reinspeccion
      AND deleted_at IS NULL;

    IF v_conteo_originales > 1 THEN
        merece_reinspeccion := false;
        motivo := 'Error crítico: Existe más de una orden original rechazada vigente en el sistema para esta placa.';
        id_reprobado := NULL;
        RETURN NEXT;
        RETURN;
    END IF;




    -- 2. Seleccionar la orden original vigente
    SELECT id, fecha_limite_reinspeccion
    INTO v_orden_id, v_fecha_limite
    FROM public.entry_orders
    WHERE vehiculo_placa_snapshot = p_placa
      AND tenant_id = p_tenant_id
      AND es_reinspeccion = false
      AND service_type = 'preventiva'
      AND estado_orden = 'finalizada'
      AND resultado_revision = 'rechazado'
      AND CURRENT_DATE <= fecha_limite_reinspeccion
      AND deleted_at IS NULL
    ORDER BY fecha DESC
    LIMIT 1;

    -- Si no hay ninguna orden que cumpla las condiciones o ya expiró
    IF v_orden_id IS NULL THEN
        merece_reinspeccion := false;
        motivo := 'No se encontró ninguna revisión preventiva rechazada que esté vigente. El plazo legal ya expiró o no existe el registro.';
        id_reprobado := NULL;
        RETURN NEXT;
        RETURN;
    END IF;






    -- 3. Comprobar que no se haya usado ya este derecho en otra orden de reinspección
    SELECT EXISTS (
        SELECT 1 
        FROM public.entry_orders 
        WHERE public.entry_orders.id_reprobado = v_orden_id
          AND es_reinspeccion = true
          AND deleted_at IS NULL
    ) INTO v_ya_reinspeccionada;

    IF v_ya_reinspeccionada THEN
        merece_reinspeccion := false;
        motivo := 'El derecho a reinspección para esta orden ya fue utilizado.';
        id_reprobado := NULL;
        RETURN NEXT;
        RETURN;
    END IF;





    -- 4. Todo correcto: Retornamos los datos asignando valores a las columnas de la tabla de salida
    merece_reinspeccion := true;
    motivo := 'Vehículo apto. Aplica para reinspección (Plazo límite: ' || to_char(v_fecha_limite, 'DD/MM/YYYY') || ')';
    id_reprobado := v_orden_id;
    
    RETURN NEXT; -- Empuja la fila armada al resultado
END;
$$;


ALTER FUNCTION "public"."check_preventiva_reinspection_eligibility"("p_placa" character varying, "p_tenant_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_rtm_primera_vez_eligibility"("p_placa" character varying, "p_tenant_id" "uuid") RETURNS TABLE("puede_primera_vez" boolean, "motivo" "text")
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_orden_id UUID;
    v_fecha_limite TIMESTAMPTZ;
    v_estado_reinspeccion public.order_status_enum;
    v_conteo_originales INT;
BEGIN
    -- ==========================================
    -- 1. CONTROL DE INTEGRIDAD / MULTIPLICIDAD
    -- ==========================================
    SELECT COUNT(*)
    INTO v_conteo_originales
    FROM public.entry_orders
    WHERE vehiculo_placa_snapshot = p_placa
      AND tenant_id = p_tenant_id
      AND es_reinspeccion = false
      AND service_type = 'RTM'
      AND estado_orden = 'finalizada'
      AND LOWER(TRIM(resultado_revision)) = 'rechazado'
      AND NOW() <= fecha_limite_reinspeccion
      AND deleted_at IS NULL;

    IF v_conteo_originales > 1 THEN
        puede_primera_vez := false; -- 🛑 Bloqueamos por consistencia de datos
        motivo := 'Error crítico: Existe más de una orden original reprobada vigente en el sistema para esta placa. Contacte al administrador para revisar el historial.';
        RETURN NEXT;
        RETURN;
    END IF;

    -- ==========================================
    -- 2. SELECCIÓN DE LA ORDEN REPROBADA VIGENTE
    -- ==========================================
    SELECT id, fecha_limite_reinspeccion
    INTO v_orden_id, v_fecha_limite
    FROM public.entry_orders
    WHERE vehiculo_placa_snapshot = p_placa
      AND tenant_id = p_tenant_id
      AND es_reinspeccion = false
      AND service_type = 'RTM'
      AND estado_orden = 'finalizada'
      AND LOWER(TRIM(resultado_revision)) = 'rechazado'
      AND NOW() <= fecha_limite_reinspeccion
      AND deleted_at IS NULL
    ORDER BY fecha DESC
    LIMIT 1;

    -- SI NO TIENE RECHAZOS VIGENTES: Puede pasar tranquilamente como Primera Vez
    IF v_orden_id IS NULL THEN
        puede_primera_vez := true;
        motivo := 'Vehículo apto para ingresar como Primera Vez.';
        RETURN NEXT;
        RETURN;
    END IF;

    -- ==========================================
    -- 3. ESTADO DE LA REINSPECCIÓN
    -- ==========================================
    SELECT estado_orden
    INTO v_estado_reinspeccion
    FROM public.entry_orders 
    WHERE public.entry_orders.id_reprobado = v_orden_id
      AND es_reinspeccion = true
      AND estado_orden IN ('abierta', 'en_prueba', 'finalizada')
      AND deleted_at IS NULL
    ORDER BY fecha DESC
    LIMIT 1;

    -- ESCENARIO A: No ha usado su reinspección
    IF v_estado_reinspeccion IS NULL THEN
        puede_primera_vez := false; -- 🛑 Bloqueamos
        motivo := 'No se permite Primera Vez. El vehículo se encuentra en periodo de gracia para Reinspección gratuita/descuento (Vence: ' || to_char(v_fecha_limite, 'DD/MM/YYYY HH:MI AM') || ').';
        RETURN NEXT;
        RETURN;
    END IF;

    -- ESCENARIO B: La reinspección se está ejecutando ahora mismo
    IF v_estado_reinspeccion IN ('abierta', 'en_prueba') THEN
        puede_primera_vez := false; -- 🛑 Bloqueamos
        motivo := 'El vehículo tiene una orden de reinspección en curso en este momento. No se puede generar una nueva orden de Primera Vez simultáneamente.';
        RETURN NEXT;
        RETURN;
    END IF;

    -- ESCENARIO C: La reinspección está FINALIZADA
    puede_primera_vez := true; -- ✅ Permitimos
    motivo := 'El vehículo ya agotó su derecho a reinspección para el último rechazo. Puede ingresar pagando una nueva Primera Vez.';
    
    RETURN NEXT;
END;
$$;


ALTER FUNCTION "public"."check_rtm_primera_vez_eligibility"("p_placa" character varying, "p_tenant_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_rtm_reinspection_eligibility"("p_placa" character varying, "p_tenant_id" "uuid") RETURNS TABLE("merece_reinspeccion" boolean, "motivo" "text", "id_reprobado" "uuid")
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_orden_id UUID;
    v_fecha_limite DATE;
    v_conteo_originales INT;
    v_ya_reinspeccionada BOOLEAN;
BEGIN



    -- 1. Contar cuántas órdenes originales vigentes existen
    SELECT COUNT(*)
    INTO v_conteo_originales
    FROM public.entry_orders
    WHERE vehiculo_placa_snapshot = p_placa
      AND tenant_id = p_tenant_id
      AND es_reinspeccion = false
      AND service_type = 'RTM'
      AND estado_orden = 'finalizada'
      AND resultado_revision = 'rechazado'
      AND CURRENT_DATE <= fecha_limite_reinspeccion
      AND deleted_at IS NULL;

    IF v_conteo_originales > 1 THEN
        merece_reinspeccion := false;
        motivo := 'Error crítico: Existe más de una orden original rechazada vigente en el sistema para esta placa.';
        id_reprobado := NULL;
        RETURN NEXT;
        RETURN;
    END IF;




    -- 2. Seleccionar la orden original vigente
    SELECT id, fecha_limite_reinspeccion
    INTO v_orden_id, v_fecha_limite
    FROM public.entry_orders
    WHERE vehiculo_placa_snapshot = p_placa
      AND tenant_id = p_tenant_id
      AND es_reinspeccion = false
      AND service_type = 'RTM'
      AND estado_orden = 'finalizada'
      AND resultado_revision = 'rechazado'
      AND CURRENT_DATE <= fecha_limite_reinspeccion
      AND deleted_at IS NULL
    ORDER BY fecha DESC
    LIMIT 1;

    -- Si no hay ninguna orden que cumpla las condiciones o ya expiró
    IF v_orden_id IS NULL THEN
        merece_reinspeccion := false;
        motivo := 'No se encontró ninguna revisión técnico-mecánica rechazada que esté vigente. El plazo legal ya expiró o no existe el registro.';
        id_reprobado := NULL;
        RETURN NEXT;
        RETURN;
    END IF;






    -- 3. Comprobar que no se haya usado ya este derecho en otra orden de reinspección
    SELECT EXISTS (
        SELECT 1 
        FROM public.entry_orders 
        WHERE public.entry_orders.id_reprobado = v_orden_id
          AND es_reinspeccion = true
          AND deleted_at IS NULL
    ) INTO v_ya_reinspeccionada;

    IF v_ya_reinspeccionada THEN
        merece_reinspeccion := false;
        motivo := 'El derecho a reinspección para esta orden ya fue utilizado.';
        id_reprobado := NULL;
        RETURN NEXT;
        RETURN;
    END IF;





    -- 4. Todo correcto: Retornamos los datos asignando valores a las columnas de la tabla de salida
    merece_reinspeccion := true;
    motivo := 'Vehículo apto. Aplica para reinspección (Plazo límite: ' || to_char(v_fecha_limite, 'DD/MM/YYYY') || ')';
    id_reprobado := v_orden_id;
    
    RETURN NEXT; -- Empuja la fila armada al resultado
END;
$$;


ALTER FUNCTION "public"."check_rtm_reinspection_eligibility"("p_placa" character varying, "p_tenant_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_full_order"("p_data" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
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
    IF v_input_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.entry_orders WHERE id = v_input_id) THEN
        SELECT consecutivo INTO v_consecutivo FROM public.entry_orders WHERE id = v_input_id;
    ELSE
        SELECT COALESCE(MAX(consecutivo), 0) + 1 
        INTO v_consecutivo 
        FROM public.entry_orders 
        WHERE tenant_id = v_tenant_id;
    END IF;


    -- =========================================================================
    -- PASO 0.4: VALIDACIÓN DE INTEGRIDAD EN REINSPECCIONES
    -- =========================================================================
    IF COALESCE((p_data->>'es_reinspeccion')::boolean, false) = true AND (p_data->>'id_reprobado') IS NULL THEN
        RAISE EXCEPTION 'Operación cancelada: La orden está marcada como Reinspección pero no se proporcionó el ID de la orden reprobada original.';
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
        id_reprobado,
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
        -- 🌟 LOGICA CONDICIONAL: Solo guarda si es_reinspeccion es TRUE
        CASE 
            WHEN COALESCE((p_data->>'es_reinspeccion')::boolean, false) = true 
            THEN (p_data->>'id_reprobado')::uuid 
            ELSE NULL 
        END,
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
        id_reprobado = EXCLUDED.id_reprobado,
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


ALTER FUNCTION "public"."create_full_order"("p_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_full_order_template"("p_data" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_template_id uuid;
    v_tenant_id uuid;
    v_signature_record jsonb;
    v_signature_id uuid;
    
    -- Variables para la nueva validación
    v_document_code text;
    v_new_version integer;
    v_max_version integer;
BEGIN
    -- 0. Extraemos los datos de control iniciales
    v_tenant_id := (p_data->>'tenant_id')::uuid;
    v_document_code := (p_data->>'document_code');
    v_new_version := (p_data->>'version')::integer;

    -- ==============================================================================
    -- VALIDADOR DE CONTROL DE VERSIONES (ISO 17020)
    -- ==============================================================================
    -- Buscamos la versión más alta existente para este código de documento y tenant
    SELECT COALESCE(MAX(version), 0)
    INTO v_max_version
    FROM public.order_template
    WHERE tenant_id = v_tenant_id
      AND document_code = v_document_code;

    -- Si ya existen versiones y la nueva versión es menor o igual a la máxima, bloqueamos
    IF v_max_version > 0 AND v_new_version <= v_max_version THEN
        RAISE EXCEPTION 'Control de documentos rechazado: El código % ya cuenta con la versión %. La nueva versión debe ser estrictamente mayor (mínimo %).', 
            v_document_code, v_max_version, (v_max_version + 1)
            USING ERRCODE = '45000'; -- Código personalizado para excepciones de negocio
    END IF;
    -- ==============================================================================


    -- 1. Insertamos en la tabla principal order_template
    INSERT INTO public.order_template (
        tenant_id,
        template_name,
        version,
        is_active,
        document_date,
        document_code,
        logo_url,
        base_contract_text,
        created_by
    )
    VALUES (
        v_tenant_id,
        (p_data->>'template_name'),
        v_new_version,
        (p_data->>'is_active')::boolean,
        (p_data->>'document_date')::date,
        v_document_code,
        (p_data->>'logo_url'),
        (p_data->>'base_contract_text'),
        (p_data->>'created_by')::uuid
    )
    RETURNING id INTO v_template_id;

    -- 2. Insertamos las condiciones (Hacemos el loop interno con jsonb_to_recordset)
    INSERT INTO public.order_template_conditions (
        tenant_id,
        order_template_id,
        label,
        is_special,
        special_condition_label,
        default_value
    )
    SELECT 
        v_tenant_id,
        v_template_id,
        t.label,
        t.is_special,
        t.special_condition_label,
        t.default_value::public.condition_response_enum
    FROM jsonb_to_recordset(p_data->'conditions') AS t(
        label text,
        is_special boolean,
        special_condition_label text,
        default_value text
    );

    -- 3. PROCESO DE FIRMAS Y DECLARACIONES
    FOR v_signature_record IN SELECT * FROM jsonb_array_elements(p_data->'signatures')
    LOOP
        -- A. Insertamos la Firma actual del loop
        INSERT INTO public.order_template_signatures (
            tenant_id,
            order_template_id,
            representative_type,
            signature_label
        )
        VALUES (
            v_tenant_id,
            v_template_id,
            v_signature_record->>'a_quien_representa',
            v_signature_record->>'label_firma'
        )
        RETURNING id INTO v_signature_id;

        -- B. Insertamos todas las declaraciones de ESTA firma específica
        INSERT INTO public.order_template_signature_conditions (
            tenant_id,
            order_template_signature_id,
            declaration_text
        )
        SELECT 
            v_tenant_id,
            v_signature_id,
            d.texto_declaracion
        FROM jsonb_to_recordset(v_signature_record->'declarations') AS d(
            texto_declaracion text
        );
    END LOOP;

    -- Devolvemos el ID generado
    RETURN v_template_id;
END;
$$;


ALTER FUNCTION "public"."create_full_order_template"("p_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fetch_data_with_placa"("p_placa" "text", "p_tenant_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_vehicle_row RECORD;
    v_owner_json JSONB;
    v_customer_json JSONB;
    v_last_customer_id UUID; 
    v_is_owner_same_as_customer BOOLEAN := FALSE;
    v_has_active_order BOOLEAN := FALSE; -- 🌟 Variable añadida para el control de duplicados
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

    -- =========================================================================
    -- 🌟 CONTROL ADAPTADO: VALIDACIÓN DE ÓRDENES ACTIVAS O EN PROCESO
    -- =========================================================================
    SELECT EXISTS (
        SELECT 1 
        FROM public.entry_orders
        WHERE tenant_id = p_tenant_id
          AND vehiculo_placa_snapshot = UPPER(TRIM(p_placa))
          AND estado_orden IN ('abierta'::public.order_status_enum, 'en_prueba'::public.order_status_enum)
          AND deleted_at IS NULL
    ) INTO v_has_active_order;

    IF v_has_active_order THEN
        RAISE EXCEPTION 'Operación cancelada: El vehículo con placa % ya cuenta con una orden de entrada activa (Abierta o En Prueba) en este centro.', UPPER(TRIM(p_placa));
    END IF;
    -- =========================================================================

    -- 3. Si existe y está libre, buscamos los datos del propietario actual en la tabla personas
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

    -- 4. Buscar ÚNICAMENTE el cliente_id de la última orden de entrada para este vehículo
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

    -- 7. Construimos el objeto unificado de salida
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


ALTER FUNCTION "public"."fetch_data_with_placa"("p_placa" "text", "p_tenant_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fetch_entry_order_by_id"("p_order_id" "uuid", "p_tenant_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("id" "uuid", "tenant_id" "uuid", "consecutivo" integer, "fecha" timestamp with time zone, "kilometraje" character varying, "es_reinspeccion" boolean, "observaciones" "text", "estado_orden" "public"."order_status_enum", "soat_vencimiento_snapshot" "date", "gas_numero_snapshot" character varying, "gas_vencimiento_snapshot" "date", "service_type" "public"."service_type_enum", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "vehiculo_id" "uuid", "propietario_id" "uuid", "cliente_id" "uuid", "funcionario_id" "uuid", "plantilla_id" "uuid", "plantilla_nombre" "text", "plantilla_version" integer, "plantilla_fecha_documento" "date", "plantilla_codigo_documento" "text", "plantilla_logo_url" "text", "plantilla_texto_contractual" "text", "vehiculo_placa" character varying, "vehiculo_marca" character varying, "vehiculo_linea" character varying, "vehiculo_modelo" integer, "vehiculo_color" character varying, "vehiculo_tipo_vehiculo" "public"."vehicle_type_enum", "vehiculo_clase" character varying, "vehiculo_combustible" character varying, "vehiculo_cilindrada" integer, "vehiculo_blindaje" boolean, "vehiculo_capacidad_pasajeros" integer, "vehiculo_es_ensenanza" boolean, "vehiculo_tipo_servicio_vehiculo" "public"."vehicle_service_type_enum", "vehiculo_es_extranjero" boolean, "propietario_nombre" "text", "propietario_documento" "text", "propietario_tipo_documento" "text", "cliente_nombre" "text", "cliente_documento" "text", "cliente_tipo_documento" "text", "funcionario_nombre" "text", "funcionario_documento" "text", "funcionario_firma" "text", "presiones_llantas" "jsonb", "condiciones_plantilla" "jsonb", "firmas_orden" "jsonb")
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        -- Bloque: Orden de Entrada
        o.id,
        o.tenant_id,
        o.consecutivo,
        o.fecha,
        o.kilometraje,
        o.es_reinspeccion,
        o.observaciones,
        o.estado_orden,
        o.soat_vencimiento_snapshot,
        o.gas_numero_snapshot,
        o.gas_vencimiento_snapshot,
        
        o.service_type,
        o.created_at,
        o.updated_at,
        o.vehiculo_id,
        o.propietario_id,
        o.cliente_id,
        o.funcionario_id,
        o.plantilla_id,
        
        -- Bloque: Metadatos de la Plantilla
        t.template_name AS plantilla_nombre,
        t.version AS plantilla_version,
        t.document_date AS plantilla_fecha_documento,
        t.document_code AS plantilla_codigo_documento,
        t.logo_url AS plantilla_logo_url,
        t.base_contract_text AS plantilla_texto_contractual,

        -- Bloque: Especificaciones del Vehículo EXTRAÍDAS DEL SNAPSHOT (Rendimiento puro)
        o.vehiculo_placa_snapshot AS vehiculo_placa,
        o.vehiculo_marca_snapshot AS vehiculo_marca,
        o.vehiculo_linea_snapshot AS vehiculo_linea,
        o.vehiculo_modelo_snapshot AS vehiculo_modelo,
        o.vehiculo_color_snapshot AS vehiculo_color,
        o.vehiculo_tipo_snapshot AS vehiculo_tipo_vehiculo,
        o.vehiculo_clase_snapshot AS vehiculo_clase,
        o.vehiculo_combustible_snapshot AS vehiculo_combustible,
        o.vehiculo_cilindrada_snapshot AS vehiculo_cilindrada,
        o.vehiculo_blindaje_snapshot AS vehiculo_blindaje,
        o.vehiculo_capacidad_pasajeros_snapshot AS vehiculo_capacidad_pasajeros,
        o.vehiculo_es_ensenanza_snapshot AS vehiculo_es_ensenanza,
        o.vehiculo_tipo_servicio_snapshot AS vehiculo_tipo_servicio_vehiculo,
        o.vehiculo_es_extranjero_snapshot AS vehiculo_es_extranjero,
        
        -- Bloque: Snapshots de Personas (Evita consultar la tabla personas)
        o.propietario_nombre_snapshot AS propietario_nombre,
        o.propietario_numero_documento_snapshot::TEXT AS propietario_documento,
        o.propietario_tipo_documento_snapshot::TEXT AS propietario_tipo_documento,
        o.cliente_nombre_snapshot AS cliente_nombre,
        o.cliente_numero_documento_snapshot::TEXT AS cliente_documento,
        o.cliente_tipo_documento_snapshot::TEXT AS cliente_tipo_documento,
        o.funcionario_nombre_snapshot AS funcionario_nombre,
        o.funcionario_numero_documento_snapshot::TEXT AS funcionario_documento,
        o.funcionario_firma_base64_snapshot AS funcionario_firma,

        -- Bloque Subconsulta: Mediciones de Presión
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'eje', tp.eje,
                    'posicion', tp.posicion,
                    'encontrada', tp.presion_encontrada,
                    'ajustada', tp.presion_ajustada
                ) 
                ORDER BY tp.eje ASC, tp.posicion ASC
            )
            FROM public.entry_order_tire_pressures tp
            WHERE tp.entry_order_id = o.id 
              AND tp.tenant_id = o.tenant_id
              AND tp.deleted_at IS NULL
        ) AS presiones_llantas,

        -- Bloque Subconsulta: Condiciones de Control
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', tc.id,
                    'label', tc.label,
                    'is_special', tc.is_special,
                    'special_condition_label', tc.special_condition_label,
                    'default_value', CASE 
                        WHEN ocr.value IS NOT NULL THEN ocr.value
                        WHEN tc.is_special = TRUE THEN tc.default_value
                        ELSE 'cumple'::public.condition_response_enum
                    END
                )
                ORDER BY tc.is_special DESC, tc.created_at ASC
            )
            FROM public.order_template_conditions tc
            LEFT JOIN public.order_condition_results ocr
                ON ocr.template_condition_id = tc.id
               AND ocr.entry_order_id = o.id
               AND ocr.tenant_id = o.tenant_id
            WHERE tc.order_template_id = o.plantilla_id
              AND tc.tenant_id = o.tenant_id
              AND tc.deleted_at IS NULL
        ) AS condiciones_plantilla,

        -- Bloque Subconsulta 3: Firmas Dinámicas Complementarias (EXCLUSIVO CLIENTE / PROPIETARIO / OTROS)
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'template_signature_id', ots.id,
                    'representative_type', ots.representative_type,
                    'signature_label', ots.signature_label,
                    
                    -- Aquí NUNCA entra el inspector. Es puramente para las firmas dinámicas de la tabla order_signatures
                    'signature_url', COALESCE(os.signature_url, ''),
                    
                    'conditions', COALESCE(
                        (
                            SELECT jsonb_agg(
                                jsonb_build_object(
                                    'condition_id', os_cond.id,
                                    'declaration_text', os_cond.declaration_text
                                )
                                ORDER BY os_cond.created_at ASC
                            )
                            FROM public.order_template_signature_conditions os_cond
                            WHERE os_cond.order_template_signature_id = ots.id
                              AND os_cond.tenant_id = o.tenant_id
                              AND os_cond.deleted_at IS NULL
                        ), 
                        '[]'::jsonb
                    )
                )
                ORDER BY ots.created_at ASC
            )
            FROM public.order_template_signatures ots
            
            -- LEFT JOIN puro para traer la firma de la tabla dinámica
            LEFT JOIN public.order_signatures os
                ON os.template_signature_id = ots.id
               AND os.entry_order_id = o.id
               AND os.tenant_id = o.tenant_id
               
            WHERE ots.order_template_id = o.plantilla_id
              AND ots.tenant_id = o.tenant_id
              -- ¡CLAVE! Excluimos cualquier intento de mapear al inspector en este bloque dinámico
              AND LOWER(ots.representative_type) NOT LIKE '%inspector%'
              AND LOWER(ots.representative_type) NOT LIKE '%funcionario%'
              AND ots.deleted_at IS NULL
        ) AS firmas_orden

    FROM public.entry_orders o
    
    LEFT JOIN public.order_template t 
        ON o.plantilla_id = t.id 
        AND t.deleted_at IS NULL
        
    WHERE o.id = p_order_id
      AND o.tenant_id = p_tenant_id
      AND o.deleted_at IS NULL;
END;
$$;


ALTER FUNCTION "public"."fetch_entry_order_by_id"("p_order_id" "uuid", "p_tenant_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fetch_entry_orders_list"("p_tenant_id" "uuid", "p_limit" integer DEFAULT 20, "p_offset" integer DEFAULT 0, "p_placa" "text" DEFAULT NULL::"text", "p_estado" "public"."order_status_enum" DEFAULT NULL::"public"."order_status_enum", "p_fecha_desde" "date" DEFAULT CURRENT_DATE, "p_fecha_hasta" "date" DEFAULT CURRENT_DATE, "p_cliente_documento" "text" DEFAULT NULL::"text", "p_propietario_documento" "text" DEFAULT NULL::"text", "p_order_by_column" "text" DEFAULT 'fecha'::"text", "p_order_by_direction" "text" DEFAULT 'DESC'::"text", "p_show_deleted" boolean DEFAULT false, "p_search_column" "text" DEFAULT NULL::"text", "p_search_term" "text" DEFAULT NULL::"text") RETURNS TABLE("id" "uuid", "placa" "text", "fecha" timestamp with time zone, "marca" "text", "linea" "text", "propietario_nombre" "text", "propietario_documento" "text", "propietario_tipo_documento" "text", "cliente_nombre" "text", "cliente_documento" "text", "cliente_tipo_documento" "text", "es_reinspeccion" boolean, "kilometraje" character varying, "soat_vencimiento_snapshot" "date", "service_type" "public"."service_type_enum", "vehiculo_tipo_snapshot" "public"."vehicle_type_enum", "vehiculo_tipo_servicio_snapshot" "public"."vehicle_service_type_enum", "estado_orden" "public"."order_status_enum", "oficina_pin" character varying, "oficina_pago" numeric, "oficina_consecutivo_factura" character varying, "oficina_tipo_pago" "public"."office_payment_type_enum", "oficina_num_aprobacion" character varying, "se_compro_soat" boolean, "resultado_revision" "text", "consecutivo_fur" character varying, "consecutivo_rtm" character varying, "total_count" bigint)
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $_$
BEGIN
    -- 💡 SOLO UN RETURN: Todo el query se vuelve un string dentro de format()
    RETURN QUERY EXECUTE format('
        SELECT
            o.id,
            o.vehiculo_placa_snapshot::TEXT AS placa,
            o.fecha,
            o.vehiculo_marca_snapshot::TEXT AS marca,
            o.vehiculo_linea_snapshot::TEXT AS linea,
            o.propietario_nombre_snapshot AS propietario_nombre,
            o.propietario_numero_documento_snapshot::TEXT AS propietario_documento,
            o.propietario_tipo_documento_snapshot::TEXT AS propietario_tipo_documento,   -- 🌟 NUEVO
            o.cliente_nombre_snapshot AS cliente_nombre,
            o.cliente_numero_documento_snapshot::TEXT AS cliente_documento,
            o.cliente_tipo_documento_snapshot::TEXT AS cliente_tipo_documento,           -- 🌟 NUEVO
            o.es_reinspeccion,                                                           -- 🌟 NUEVO
            o.kilometraje,                                                               -- 🌟 NUEVO
            o.soat_vencimiento_snapshot,                                                 -- 🌟 NUEVO
            o.service_type,                                                              -- 🌟 NUEVO
            o.vehiculo_tipo_snapshot,                                                    -- 🌟 NUEVO
            o.vehiculo_tipo_servicio_snapshot,
            o.estado_orden,
            -- 🌟 MAPEO DE NUEVOS CAMPOS DESDE LA TABLA
            o.oficina_pin,
            o.oficina_pago,
            o.oficina_consecutivo_factura,
            o.oficina_tipo_pago,
            o.oficina_num_aprobacion,
            
            o.se_compro_soat,
            o.resultado_revision,
            o.consecutivo_fur,
            o.consecutivo_rtm,
            COUNT(*) OVER() AS total_count
        FROM public.entry_orders o
        WHERE
            -- AISLAMIENTO MULTI-TENANT (Solo validamos el soft delete de la orden)
            o.tenant_id = $1
            
            -- 🌟 NUEVO: Si porcentaje con el 10 es TRUE muestra todo, si es FALSE exige que deleted_at sea NULL
            AND ($10 = TRUE OR o.estado_orden != ''anulada''::public.order_status_enum)

            -- FILTRO POR PLACA (Sobre el Snapshot)
            AND ($2 IS NULL OR o.vehiculo_placa_snapshot ILIKE ''%%'' || TRIM($2) || ''%%'')

            -- FILTRO POR ESTADO
            AND ($3 IS NULL OR o.estado_orden = $3)

            -- FILTROS DE FECHAS
            AND o.fecha::DATE >= $4
            AND o.fecha::DATE <= $5

            -- FILTRO DOCUMENTO CLIENTE (Sobre el Snapshot)
            AND ($6 IS NULL OR o.cliente_numero_documento_snapshot ILIKE ''%%'' || TRIM($6) || ''%%'')

            -- FILTRO DOCUMENTO PROPIETARIO (Sobre el Snapshot)
            AND ($7 IS NULL OR o.propietario_numero_documento_snapshot ILIKE ''%%'' || TRIM($7) || ''%%'')
            
            -- 🌟 NUEVO BLOQUE: BÚSQUEDA EXCLUSIVA POR COLUMNA SELECCIONADA ($11 y $12)
            -- Evaluamos dinámicamente según el valor que venga del componente Select de la UI
            AND (
                $12 IS NULL OR TRIM($12) = '''' -- Si la barra de búsqueda está vacía, ignora todo este bloque e imprime los datos normales
                OR (
                    CASE $11
                        -- Si seleccionó "Placa", busca coincidencias parciales ignorando mayúsculas/minúsculas
                        WHEN ''placa'' THEN 
                            o.vehiculo_placa_snapshot ILIKE ''%%'' || TRIM($12) || ''%%''
                        
                        -- 🌟 NUEVO: Si seleccionó "Marca", busca en el snapshot del vehículo (ej: Chevrolet, Renault)
                        WHEN ''marca'' THEN 
                            o.vehiculo_marca_snapshot ILIKE ''%%'' || TRIM($12) || ''%%''
                        
                        -- 🌟 NUEVO: Si seleccionó "Línea", busca en la línea/modelo del vehículo (ej: Spark, Logan)
                        WHEN ''linea'' THEN 
                            o.vehiculo_linea_snapshot ILIKE ''%%'' || TRIM($12) || ''%%''
                        
                        -- 🌟 AJUSTADO: Busca estrictamente por el documento del CLIENTE
                        WHEN ''doc_cliente'' THEN 
                            o.cliente_numero_documento_snapshot ILIKE ''%%'' || TRIM($12) || ''%%''
                        
                        -- 🌟 AJUSTADO: Busca estrictamente por el documento del PROPIETARIO
                        WHEN ''doc_propietario'' THEN 
                            o.propietario_numero_documento_snapshot ILIKE ''%%'' || TRIM($12) || ''%%''
                        
                        -- Si mandan una columna inválida por error, no retorna filas por seguridad
                        ELSE FALSE
                    END
                )
            )
            
        -- 🌟 El ordenamiento se inyecta dinámicamente aquí antes de paginar
        ORDER BY %I %s
        
        LIMIT $8 OFFSET $9

        -- la I con el simbolo de porcentaje (Identificador): Le dice a la función: "Toma el string que te pasé (p_order_by_column) y escríbelo aquí como una columna real de la tabla, poniéndole comillas dobles si es necesario".
    ', p_order_by_column, p_order_by_direction)
    USING 
        p_tenant_id,            -- $1  (ID del CDA / Organización activa)
        p_placa,                -- $2  (Filtro directo de placa)
        p_estado,               -- $3  (Filtro directo por estado)
        p_fecha_desde,          -- $4  (Rango de calendario inicial)
        p_fecha_hasta,          -- $5  (Rango de calendario final)
        p_cliente_documento,    -- $6  (Filtro de documento cliente)
        p_propietario_documento,  -- $7  (Filtro de documento propietario)
        p_limit,                -- $8  (Cantidad de filas a traer)
        p_offset,               -- $9  (Paginación de las filas)
        p_show_deleted,         -- $10 (Booleano para incluir órdenes anuladas)
        p_search_column,        -- $11 🌟 (Columna activa del Select de búsqueda)
        p_search_term;          -- $12 🌟 (Texto escrito en la barra de búsqueda)
END;
$_$;


ALTER FUNCTION "public"."fetch_entry_orders_list"("p_tenant_id" "uuid", "p_limit" integer, "p_offset" integer, "p_placa" "text", "p_estado" "public"."order_status_enum", "p_fecha_desde" "date", "p_fecha_hasta" "date", "p_cliente_documento" "text", "p_propietario_documento" "text", "p_order_by_column" "text", "p_order_by_direction" "text", "p_show_deleted" boolean, "p_search_column" "text", "p_search_term" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fetch_orders_templates"("p_tenant_id" "uuid") RETURNS TABLE("id" "uuid", "tenant_id" "uuid", "template_name" "text", "version" integer, "is_active" boolean, "document_date" "date", "document_code" "text", "logo_url" "text", "base_contract_text" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "created_by" "uuid", "conditions" "jsonb", "signatures" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.tenant_id,
        t.template_name,
        t.version,
        t.is_active,
        t.document_date,
        t.document_code,
        t.logo_url,
        t.base_contract_text,
        t.created_at,
        t.updated_at,
        t.created_by,
        -- 1. AGREGACIÓN DE CONDICIONES DE LA PLANTILLA
        --aqui el coalesce que esta hecho para devolver el primer valor no null que se encuentre, en este caso especifico solo tendria o el array de objects
        --o null, y en el caso de null pues lo convierte a un array vacio [].
        COALESCE(
            (
                 --el jsonb_agg es como un agregador que va llenando el array [] con cada object que sale de jsonb_build_object, que se ejectua por cada
                --c.order_template_id = t.id que se encuentre y eso dentro de cada t.tenant_id = p_tenant_id de la consulta externa
                SELECT jsonb_agg(jsonb_build_object(
                    'id', c.id,
                    'label', c.label,
                    'is_special', c.is_special,
                    'special_condition_label', c.special_condition_label,
                    'default_value', c.default_value
                ) ORDER BY c.created_at ASC)
                FROM order_template_conditions c
                --Por cada plantilla (t.id), Postgres va a la tabla de condiciones y busca todas las que le pertenecen. 
                --Imagina que para la "Plantilla A" encuentra 3 filas.
                WHERE c.order_template_id = t.id 
                  AND c.deleted_at IS NULL
            ), 
            '[]'::jsonb
        ) as conditions,
        -- 2. AGREGACIÓN DE FIRMAS CON SUS DECLARACIONES (ANIDADO)
        -- Subconsulta para Firmas (Agregada)
        COALESCE(
            (
                SELECT jsonb_agg(jsonb_build_object(
                    'id', s.id,
                    'representative_type', s.representative_type,
                    'signature_label', s.signature_label,
                    -- Sub-agregación de condiciones/declaraciones por firma
                    'declarations', COALESCE(
                        (
                            SELECT jsonb_agg(jsonb_build_object(
                                'id', sc.id,
                                'declaration_text', sc.declaration_text
                            ) ORDER BY sc.created_at ASC)
                            FROM order_template_signature_conditions sc
                            WHERE sc.order_template_signature_id = s.id
                              AND sc.deleted_at IS NULL
                        ),
                        '[]'::jsonb
                    )
                ) ORDER BY s.created_at ASC)
                FROM order_template_signatures s
                WHERE s.order_template_id = t.id 
                  AND s.deleted_at IS NULL
            ), 
            '[]'::jsonb
        ) as signatures
    FROM order_template t
    WHERE t.tenant_id = p_tenant_id
      AND t.deleted_at IS NULL
    ORDER BY t.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."fetch_orders_templates"("p_tenant_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_tenant_data"("p_tenant_slug" "text") RETURNS TABLE("id" "uuid", "name" "text", "domain" "text", "logo_url" "text")
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  SELECT id, name, domain, logo_url
  FROM tenants
  WHERE domain = p_tenant_slug
  LIMIT 1;
$$;


ALTER FUNCTION "public"."get_tenant_data"("p_tenant_slug" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_tenant_name"("p_tenant_slug" "text") RETURNS "text"
    LANGUAGE "sql"
    SET "search_path" TO 'public'
    AS $$
  select name
  from tenants
  where slug = p_tenant_slug
  limit 1;
$$;


ALTER FUNCTION "public"."get_tenant_name"("p_tenant_slug" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_tenant_roles"("p_tenant_id" "uuid") RETURNS "text"[]
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_service_user_id uuid;
  v_roles_array text[];
BEGIN
  -- 1. Obtenemos el ID de nuestra tabla de negocio 'service_users' 
  -- usando el ID de autenticación del JWT (auth.uid())
  SELECT id INTO v_service_user_id 
  FROM public.service_users 
  WHERE auth_user_id = auth.uid();

  -- 2. Si no encontramos un usuario de servicio, retornamos un array vacío
  IF v_service_user_id IS NULL THEN
    RETURN ARRAY[]::text[];
  END IF;

  -- 3. Buscamos todos los roles asignados a ese usuario en ESE tenant específico
  SELECT array_agg(role) INTO v_roles_array
  FROM public.tenant_permissions
  WHERE service_user_id = v_service_user_id 
    AND tenant_id = p_tenant_id;

  -- 4. Retornamos el array (o un array vacío si no tiene permisos)
  RETURN COALESCE(v_roles_array, ARRAY[]::text[]);
END;
$$;


ALTER FUNCTION "public"."get_tenant_roles"("p_tenant_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_single_session"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  -- Borramos todas las sesiones del usuario EXCEPTO la que se acaba de crear
  delete from auth.sessions
  where user_id = new.user_id
    and id != new.id;
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_single_session"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_user_active_status"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('is_active', NEW.is_active)
  WHERE id = NEW.auth_user_id;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_user_active_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_director_tecnico_order"("p_order_id" "uuid", "p_resultado_revision" "text", "p_consecutivo_fur" character varying, "p_consecutivo_rtm" character varying, "p_director_tecnico_tipo_documento_snapshot" "text", "p_director_tecnico_numero_documento_snapshot" character varying, "p_director_tecnico_nombre_snapshot" "text", "p_director_tecnico_firma_base64_snapshot" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- 1. Verificación defensiva de la existencia de la orden
    IF NOT EXISTS (SELECT 1 FROM public.entry_orders WHERE id = p_order_id) THEN
        RAISE EXCEPTION 'La orden de entrada con ID % no existe.', p_order_id;
    END IF;

    -- 2. Ejecución de la actualización del Cierre Técnico (ISO 17020)
    UPDATE public.entry_orders
    SET
        resultado_revision = NULLIF(TRIM(p_resultado_revision), ''),
        consecutivo_fur = NULLIF(TRIM(p_consecutivo_fur), ''),
        consecutivo_rtm = NULLIF(TRIM(p_consecutivo_rtm), ''),
        
        -- Guardado de los snapshots del DT
        director_tecnico_tipo_documento_snapshot = NULLIF(TRIM(p_director_tecnico_tipo_documento_snapshot), ''),
        director_tecnico_numero_documento_snapshot = NULLIF(TRIM(p_director_tecnico_numero_documento_snapshot), ''),
        director_tecnico_nombre_snapshot = NULLIF(TRIM(p_director_tecnico_nombre_snapshot), ''),
        director_tecnico_firma_base64_snapshot = NULLIF(TRIM(p_director_tecnico_firma_base64_snapshot), ''),
        
        -- 🌟 CÁLCULO DE FECHA LÍMITE CON HORA EXACTA (Si es reprobada)
        fecha_limite_reinspeccion = CASE 
            WHEN LOWER(TRIM(p_resultado_revision)) = 'rechazado' THEN NOW() + INTERVAL '15 days'
            ELSE fecha_limite_reinspeccion -- Mantiene lo que tenga si no es reprobada
        END,

        -- Transición de estado
        estado_orden = 'finalizada'::public.order_status_enum
        
    WHERE id = p_order_id;

    -- 3. Retorno de confirmación
    RETURN 'Cierre técnico registrado con éxito';

END;
$$;


ALTER FUNCTION "public"."update_director_tecnico_order"("p_order_id" "uuid", "p_resultado_revision" "text", "p_consecutivo_fur" character varying, "p_consecutivo_rtm" character varying, "p_director_tecnico_tipo_documento_snapshot" "text", "p_director_tecnico_numero_documento_snapshot" character varying, "p_director_tecnico_nombre_snapshot" "text", "p_director_tecnico_firma_base64_snapshot" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_office_order_data"("p_order_id" "uuid", "p_pin" character varying, "p_pago" numeric, "p_consecutivo_factura" character varying, "p_tipo_pago" "text", "p_se_compro_soat" boolean) RETURNS "text"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- 1. Verificación defensiva de la existencia de la orden
    IF NOT EXISTS (SELECT 1 FROM public.entry_orders WHERE id = p_order_id) THEN
        RAISE EXCEPTION 'La orden de entrada con ID % no existe.', p_order_id;
    END IF;

    -- 2. Ejecución de la actualización
    UPDATE public.entry_orders
    SET
        oficina_pin = NULLIF(TRIM(p_pin), ''),
        oficina_pago = COALESCE(p_pago, 0.00),
        oficina_consecutivo_factura = NULLIF(TRIM(p_consecutivo_factura), ''),
        oficina_tipo_pago = p_tipo_pago::public.office_payment_type_enum,
        se_compro_soat = COALESCE(p_se_compro_soat, false),
        estado_orden = 'en_prueba'::public.order_status_enum, -- 🌟 Cambia el estado para habilitarla en pista
        updated_at = NOW()
    WHERE id = p_order_id;

    -- 3. Retornamos el string exacto que necesitas
    RETURN 'Datos guardados con exito';

END;
$$;


ALTER FUNCTION "public"."update_office_order_data"("p_order_id" "uuid", "p_pin" character varying, "p_pago" numeric, "p_consecutivo_factura" character varying, "p_tipo_pago" "text", "p_se_compro_soat" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_office_order_data"("p_order_id" "uuid", "p_pin" character varying, "p_pago" numeric, "p_consecutivo_factura" character varying, "p_tipo_pago" "text", "p_se_compro_soat" boolean, "p_num_aprobacion" character varying DEFAULT NULL::character varying) RETURNS "text"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- 1. Verificación defensiva de la existencia de la orden
    IF NOT EXISTS (SELECT 1 FROM public.entry_orders WHERE id = p_order_id) THEN
        RAISE EXCEPTION 'La orden de entrada con ID % no existe.', p_order_id;
    END IF;

    -- 🌟 2. VALIDACIÓN DEFENSIVA EN BASE DE DATOS PARA TARJETAS
    IF (p_tipo_pago = 'tarjeta_debito' OR p_tipo_pago = 'tarjeta_credito') 
        AND (p_num_aprobacion IS NULL OR TRIM(p_num_aprobacion) = '') THEN
        RAISE EXCEPTION 'Operación cancelada: Las transacciones con tarjeta requieren un número de aprobación válido.';
    END IF;

    -- 3. Ejecución de la actualización
    UPDATE public.entry_orders
    SET
        oficina_pin = NULLIF(TRIM(p_pin), ''),
        oficina_pago = COALESCE(p_pago, 0.00),
        oficina_consecutivo_factura = NULLIF(TRIM(p_consecutivo_factura), ''),
        oficina_tipo_pago = p_tipo_pago::public.office_payment_type_enum,
        -- 🌟 Guardamos el número de aprobación (si no es tarjeta, se guardará NULL de forma limpia)
        oficina_num_aprobacion = CASE 
            WHEN p_tipo_pago IN ('tarjeta_debito', 'tarjeta_credito') THEN NULLIF(TRIM(p_num_aprobacion), '')
            ELSE NULL 
        END,
        se_compro_soat = COALESCE(p_se_compro_soat, false),
        estado_orden = 'en_prueba'::public.order_status_enum, -- Pasa a pista
        updated_at = NOW()
    WHERE id = p_order_id;

    -- 4. Retornamos el mensaje de éxito
    RETURN 'Datos guardados con exito';

END;
$$;


ALTER FUNCTION "public"."update_office_order_data"("p_order_id" "uuid", "p_pin" character varying, "p_pago" numeric, "p_consecutivo_factura" character varying, "p_tipo_pago" "text", "p_se_compro_soat" boolean, "p_num_aprobacion" character varying) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."entry_order_tire_pressures" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "entry_order_id" "uuid" NOT NULL,
    "eje" integer NOT NULL,
    "posicion" character varying NOT NULL,
    "presion_encontrada" numeric,
    "presion_ajustada" numeric,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "check_tire_position" CHECK ((("posicion")::"text" = ANY (ARRAY['izquierda'::"text", 'derecha'::"text", 'centro'::"text", 'izquierda_interior'::"text", 'derecha_interior'::"text", 'repuesto'::"text"])))
);


ALTER TABLE "public"."entry_order_tire_pressures" OWNER TO "postgres";


COMMENT ON COLUMN "public"."entry_order_tire_pressures"."posicion" IS 'Posición de la llanta: izquierda, derecha o repuesto';



CREATE TABLE IF NOT EXISTS "public"."entry_orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "consecutivo" integer NOT NULL,
    "fecha" timestamp with time zone DEFAULT "now"() NOT NULL,
    "vehiculo_id" "uuid" NOT NULL,
    "propietario_id" "uuid" NOT NULL,
    "cliente_id" "uuid" NOT NULL,
    "funcionario_id" "uuid" NOT NULL,
    "plantilla_id" "uuid" NOT NULL,
    "kilometraje" character varying,
    "es_reinspeccion" boolean DEFAULT false,
    "observaciones" "text",
    "estado_orden" "public"."order_status_enum" DEFAULT 'abierta'::"public"."order_status_enum" NOT NULL,
    "soat_vencimiento_snapshot" "date",
    "gas_numero_snapshot" character varying,
    "gas_vencimiento_snapshot" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "service_type" "public"."service_type_enum" DEFAULT 'RTM'::"public"."service_type_enum" NOT NULL,
    "vehiculo_placa_snapshot" character varying NOT NULL,
    "vehiculo_marca_snapshot" character varying NOT NULL,
    "vehiculo_linea_snapshot" character varying NOT NULL,
    "vehiculo_modelo_snapshot" integer NOT NULL,
    "vehiculo_color_snapshot" character varying NOT NULL,
    "vehiculo_tipo_snapshot" "public"."vehicle_type_enum" NOT NULL,
    "vehiculo_clase_snapshot" character varying NOT NULL,
    "vehiculo_combustible_snapshot" character varying NOT NULL,
    "vehiculo_cilindrada_snapshot" integer NOT NULL,
    "vehiculo_blindaje_snapshot" boolean NOT NULL,
    "vehiculo_capacidad_pasajeros_snapshot" integer NOT NULL,
    "vehiculo_es_ensenanza_snapshot" boolean NOT NULL,
    "vehiculo_tipo_servicio_snapshot" "public"."vehicle_service_type_enum" NOT NULL,
    "vehiculo_es_extranjero_snapshot" boolean NOT NULL,
    "propietario_tipo_documento_snapshot" "text" NOT NULL,
    "propietario_numero_documento_snapshot" character varying NOT NULL,
    "propietario_nombre_snapshot" "text" NOT NULL,
    "propietario_telefono_snapshot" character varying,
    "propietario_email_snapshot" "text",
    "propietario_direccion_snapshot" "text",
    "cliente_tipo_documento_snapshot" "text" NOT NULL,
    "cliente_numero_documento_snapshot" character varying NOT NULL,
    "cliente_nombre_snapshot" "text" NOT NULL,
    "cliente_telefono_snapshot" character varying,
    "cliente_email_snapshot" "text",
    "cliente_direccion_snapshot" "text",
    "funcionario_tipo_documento_snapshot" "text" NOT NULL,
    "funcionario_numero_documento_snapshot" character varying NOT NULL,
    "funcionario_nombre_snapshot" "text" NOT NULL,
    "funcionario_firma_base64_snapshot" "text" NOT NULL,
    "oficina_pin" character varying,
    "oficina_pago" numeric(12,2) DEFAULT 0.00,
    "oficina_consecutivo_factura" character varying,
    "oficina_tipo_pago" "public"."office_payment_type_enum",
    "se_compro_soat" boolean DEFAULT false NOT NULL,
    "resultado_revision" "text",
    "consecutivo_fur" character varying,
    "consecutivo_rtm" character varying,
    "id_reprobado" "uuid",
    "id_orden_reinspeccion" "uuid",
    "fecha_limite_reinspeccion" timestamp with time zone,
    "oficina_num_aprobacion" character varying,
    "director_tecnico_tipo_documento_snapshot" "text",
    "director_tecnico_numero_documento_snapshot" character varying,
    "director_tecnico_nombre_snapshot" "text",
    "director_tecnico_firma_base64_snapshot" "text"
);


ALTER TABLE "public"."entry_orders" OWNER TO "postgres";


COMMENT ON COLUMN "public"."entry_orders"."service_type" IS 'Tipo de servicio legal o comercial asociado a esta orden de entrada';



COMMENT ON COLUMN "public"."entry_orders"."funcionario_tipo_documento_snapshot" IS 'Snapshot del tipo de documento del funcionario que firma.';



COMMENT ON COLUMN "public"."entry_orders"."funcionario_numero_documento_snapshot" IS 'Snapshot del número de documento del funcionario que firma.';



COMMENT ON COLUMN "public"."entry_orders"."funcionario_nombre_snapshot" IS 'Snapshot del nombre completo del funcionario que firma.';



COMMENT ON COLUMN "public"."entry_orders"."funcionario_firma_base64_snapshot" IS 'Snapshot en Base64 de la firma digitalizada del funcionario.';



COMMENT ON COLUMN "public"."entry_orders"."oficina_tipo_pago" IS 'Registra la modalidad de pago con la que el cliente canceló la Revisión Técnico-Mecánica (RTM) u otros servicios. Vinculado al enum office_payment_type_enum.';



COMMENT ON COLUMN "public"."entry_orders"."consecutivo_fur" IS 'Número del Formato Uniforme de Resultados generado en la inspección';



COMMENT ON COLUMN "public"."entry_orders"."consecutivo_rtm" IS 'Número del certificado de Revisión Tecnicomecánica emitido (Satisface RUNT)';



COMMENT ON COLUMN "public"."entry_orders"."id_reprobado" IS 'Se llena en la REINSPECCIÓN. Guarda el UUID de la orden original que fue rechazada.';



COMMENT ON COLUMN "public"."entry_orders"."id_orden_reinspeccion" IS 'Se llena en la ORDEN ORIGINAL (Opcional/Históricos). Guarda el UUID de la orden que actuó como su reinspección.';



COMMENT ON COLUMN "public"."entry_orders"."fecha_limite_reinspeccion" IS 'Fecha máxima (Fecha de la orden original + 15 días calendario) en la que el vehículo puede aplicar a una reinspección.';



COMMENT ON COLUMN "public"."entry_orders"."director_tecnico_tipo_documento_snapshot" IS 'Snapshot del tipo de documento del Director Técnico que aprueba la orden.';



COMMENT ON COLUMN "public"."entry_orders"."director_tecnico_numero_documento_snapshot" IS 'Snapshot del número de documento del Director Técnico que aprueba la orden.';



COMMENT ON COLUMN "public"."entry_orders"."director_tecnico_nombre_snapshot" IS 'Snapshot del nombre completo del Director Técnico que firma el cierre.';



COMMENT ON COLUMN "public"."entry_orders"."director_tecnico_firma_base64_snapshot" IS 'Snapshot en formato Base64 de la firma digitalizada del Director Técnico (Auditoría ISO 17020).';



CREATE SEQUENCE IF NOT EXISTS "public"."entry_orders_consecutivo_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."entry_orders_consecutivo_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."entry_orders_consecutivo_seq" OWNED BY "public"."entry_orders"."consecutivo";



CREATE TABLE IF NOT EXISTS "public"."order_condition_results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "entry_order_id" "uuid" NOT NULL,
    "template_condition_id" "uuid" NOT NULL,
    "value" "public"."condition_response_enum" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."order_condition_results" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_signatures" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "entry_order_id" "uuid" NOT NULL,
    "template_signature_id" "uuid" NOT NULL,
    "signature_url" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."order_signatures" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_template" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "template_name" "text" NOT NULL,
    "version" integer DEFAULT 1 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "document_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "document_code" "text" NOT NULL,
    "logo_url" "text",
    "base_contract_text" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    "deleted_at" timestamp with time zone,
    CONSTRAINT "order_template_document_code_check" CHECK (("char_length"("document_code") > 0))
);


ALTER TABLE "public"."order_template" OWNER TO "postgres";


COMMENT ON TABLE "public"."order_template" IS 'Configuración maestra de las plantillas de orden de entrada para el SGC. v1.0';



COMMENT ON COLUMN "public"."order_template"."version" IS 'Número incremental para control de cambios inmutables.';



COMMENT ON COLUMN "public"."order_template"."is_active" IS 'Indica si la plantilla está disponible para nuevas órdenes.';



COMMENT ON COLUMN "public"."order_template"."base_contract_text" IS 'Texto legal/contrato que se copiará como snapshot a la orden.';



CREATE TABLE IF NOT EXISTS "public"."order_template_conditions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "order_template_id" "uuid" NOT NULL,
    "label" "text" NOT NULL,
    "is_special" boolean DEFAULT false NOT NULL,
    "special_condition_label" "text",
    "default_value" "public"."condition_response_enum" DEFAULT 'no_aplica'::"public"."condition_response_enum" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "special_condition_label_check" CHECK ((("is_special" = false) OR (("is_special" = true) AND ("special_condition_label" IS NOT NULL))))
);


ALTER TABLE "public"."order_template_conditions" OWNER TO "postgres";


COMMENT ON TABLE "public"."order_template_conditions" IS 'Preguntas o ítems de inspección asociados a una plantilla específica.';



COMMENT ON COLUMN "public"."order_template_conditions"."is_special" IS 'Define si la condición requiere un campo adicional (ej: checkbox de disco de freno).';



CREATE TABLE IF NOT EXISTS "public"."order_template_signature_conditions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "order_template_signature_id" "uuid" NOT NULL,
    "declaration_text" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."order_template_signature_conditions" OWNER TO "postgres";


COMMENT ON TABLE "public"."order_template_signature_conditions" IS 'Textos de aceptación legal vinculados a una firma. Todos son obligatorios por defecto.';



CREATE TABLE IF NOT EXISTS "public"."order_template_signatures" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "order_template_id" "uuid" NOT NULL,
    "representative_type" "text" NOT NULL,
    "signature_label" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."order_template_signatures" OWNER TO "postgres";


COMMENT ON TABLE "public"."order_template_signatures" IS 'Define los roles que deben firmar la orden. Texto libre para máxima adaptabilidad.';



COMMENT ON COLUMN "public"."order_template_signatures"."representative_type" IS 'Nombre del rol legal (libre): Gerente, DT, Recepcionista, etc.';



CREATE TABLE IF NOT EXISTS "public"."personas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "tipo_documento" "public"."document_type_enum" NOT NULL,
    "numero_documento" character varying NOT NULL,
    "nombre_completo" "text" NOT NULL,
    "telefono" character varying,
    "correo" character varying,
    "direccion" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."personas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "auth_user_id" "uuid" NOT NULL,
    "full_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "document_type" "text" DEFAULT 'cedula'::"text" NOT NULL,
    "document_number" "text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "signature_base64" "text",
    CONSTRAINT "service_users_document_type_check" CHECK (("document_type" = ANY (ARRAY['cedula'::"text", 'cedula_extrangeria'::"text", 'pasaporte'::"text", 'nit'::"text", 'targeta_identidad'::"text"])))
);


ALTER TABLE "public"."service_users" OWNER TO "postgres";


COMMENT ON TABLE "public"."service_users" IS 'Version del schema v1';



COMMENT ON COLUMN "public"."service_users"."document_number" IS 'Número de identificación legal (Obligatorio)';



COMMENT ON COLUMN "public"."service_users"."is_active" IS 'Control maestro de acceso al sistema';



COMMENT ON COLUMN "public"."service_users"."signature_base64" IS 'Snapshot de la firma del recepcionista codificada en Base64 (JPEG, calidad 0.4) para incrustación directa en PDFs.';



CREATE TABLE IF NOT EXISTS "public"."tenant_permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "service_user_id" "uuid" NOT NULL,
    "role" "public"."user_role_enum" DEFAULT 'recepcionista'::"public"."user_role_enum" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."tenant_permissions" OWNER TO "postgres";


COMMENT ON TABLE "public"."tenant_permissions" IS 'Maps service_users to tenants with role-based permissions.';



COMMENT ON COLUMN "public"."tenant_permissions"."role" IS 'Rol del usuario en el CDA administrado mediante el tipo estructurado public.user_role_enum.';



CREATE TABLE IF NOT EXISTS "public"."tenants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "domain" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "logo_url" "text" DEFAULT 'https://pixabay.com/images/download/raphaelsilva-avatar-3814049_1920.png'::"text",
    CONSTRAINT "tenants_name_length_check" CHECK (("char_length"("name") >= 2)),
    CONSTRAINT "tenants_slug_format_check" CHECK (("slug" ~ '^[a-z0-9-]+$'::"text"))
);


ALTER TABLE "public"."tenants" OWNER TO "postgres";


COMMENT ON TABLE "public"."tenants" IS 'Tenant root entity for multi-tenant isolation. Represents an organization/customer.';



COMMENT ON COLUMN "public"."tenants"."domain" IS 'Primary custom domain for the tenant (must be unique).';



COMMENT ON COLUMN "public"."tenants"."slug" IS 'URL-safe identifier used for subdomain or routing. Lowercase, alphanumeric and hyphens only.';



COMMENT ON COLUMN "public"."tenants"."logo_url" IS 'URL pública del logo del taller almacenado en Supabase Storage';



CREATE TABLE IF NOT EXISTS "public"."vehicles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "placa" character varying NOT NULL,
    "marca" character varying NOT NULL,
    "linea" character varying NOT NULL,
    "modelo" integer NOT NULL,
    "color" character varying NOT NULL,
    "tipo_vehiculo" "public"."vehicle_type_enum" NOT NULL,
    "clase" character varying NOT NULL,
    "combustible" character varying NOT NULL,
    "cilindrada" integer NOT NULL,
    "blindaje" boolean DEFAULT false NOT NULL,
    "capacidad_pasajeros" integer NOT NULL,
    "es_ensenanza" boolean DEFAULT false NOT NULL,
    "propietario_actual_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "tipo_servicio_vehiculo" "public"."vehicle_service_type_enum" DEFAULT 'particular'::"public"."vehicle_service_type_enum" NOT NULL,
    "es_extranjero" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."vehicles" OWNER TO "postgres";


COMMENT ON TABLE "public"."vehicles" IS 'Tabla de vehículos. Los datos de SOAT y Gas se gestionan ahora directamente en entry_orders para mantener trazabilidad histórica.';



COMMENT ON COLUMN "public"."vehicles"."tipo_servicio_vehiculo" IS 'Clasificación del servicio según la tarjeta de propiedad (Particular, Público, etc.)';



ALTER TABLE ONLY "public"."entry_order_tire_pressures"
    ADD CONSTRAINT "entry_order_tire_pressures_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."entry_orders"
    ADD CONSTRAINT "entry_orders_consecutivo_tenant_key" UNIQUE ("tenant_id", "consecutivo");



ALTER TABLE ONLY "public"."entry_orders"
    ADD CONSTRAINT "entry_orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."entry_orders"
    ADD CONSTRAINT "entry_orders_tenant_factura_key" UNIQUE ("tenant_id", "oficina_consecutivo_factura");



ALTER TABLE ONLY "public"."entry_orders"
    ADD CONSTRAINT "entry_orders_tenant_fur_key" UNIQUE ("tenant_id", "consecutivo_fur");



ALTER TABLE ONLY "public"."entry_orders"
    ADD CONSTRAINT "entry_orders_tenant_rtm_key" UNIQUE ("tenant_id", "consecutivo_rtm");



ALTER TABLE "public"."tenants"
    ADD CONSTRAINT "logo_url_not_null_check" CHECK (("logo_url" IS NOT NULL)) NOT VALID;



ALTER TABLE ONLY "public"."order_condition_results"
    ADD CONSTRAINT "order_condition_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_signatures"
    ADD CONSTRAINT "order_signatures_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_template"
    ADD CONSTRAINT "order_template_code_version_tenant_key" UNIQUE ("tenant_id", "document_code", "version");



ALTER TABLE ONLY "public"."order_template_conditions"
    ADD CONSTRAINT "order_template_conditions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_template"
    ADD CONSTRAINT "order_template_name_version_code_tenant_key" UNIQUE ("tenant_id", "template_name", "version", "document_code");



ALTER TABLE ONLY "public"."order_template"
    ADD CONSTRAINT "order_template_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_template_signature_conditions"
    ADD CONSTRAINT "order_template_signature_conditions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_template_signatures"
    ADD CONSTRAINT "order_template_signatures_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."personas"
    ADD CONSTRAINT "personas_documento_tenant_key" UNIQUE ("tenant_id", "tipo_documento", "numero_documento");



ALTER TABLE ONLY "public"."personas"
    ADD CONSTRAINT "personas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_users"
    ADD CONSTRAINT "service_users_auth_user_id_key" UNIQUE ("auth_user_id");



ALTER TABLE ONLY "public"."service_users"
    ADD CONSTRAINT "service_users_document_unique" UNIQUE ("document_type", "document_number");



ALTER TABLE ONLY "public"."service_users"
    ADD CONSTRAINT "service_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tenant_permissions"
    ADD CONSTRAINT "tenant_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tenant_permissions"
    ADD CONSTRAINT "tenant_permissions_unique_triplet" UNIQUE ("tenant_id", "service_user_id", "role");



ALTER TABLE ONLY "public"."tenants"
    ADD CONSTRAINT "tenants_domain_key" UNIQUE ("domain");



ALTER TABLE ONLY "public"."tenants"
    ADD CONSTRAINT "tenants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tenants"
    ADD CONSTRAINT "tenants_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."vehicles"
    ADD CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vehicles"
    ADD CONSTRAINT "vehicles_placa_tenant_key" UNIQUE ("tenant_id", "placa");



CREATE INDEX "entry_orders_cliente_id_idx" ON "public"."entry_orders" USING "btree" ("cliente_id");



CREATE INDEX "entry_orders_fecha_idx" ON "public"."entry_orders" USING "btree" ("fecha");



CREATE INDEX "entry_orders_fecha_limite_reinspeccion_idx" ON "public"."entry_orders" USING "btree" ("fecha_limite_reinspeccion") WHERE ("fecha_limite_reinspeccion" IS NOT NULL);



CREATE INDEX "entry_orders_funcionario_id_idx" ON "public"."entry_orders" USING "btree" ("funcionario_id");



CREATE INDEX "entry_orders_id_orden_reinspeccion_idx" ON "public"."entry_orders" USING "btree" ("id_orden_reinspeccion") WHERE ("id_orden_reinspeccion" IS NOT NULL);



CREATE INDEX "entry_orders_id_reprobado_idx" ON "public"."entry_orders" USING "btree" ("id_reprobado") WHERE ("id_reprobado" IS NOT NULL);



CREATE INDEX "entry_orders_plantilla_id_idx" ON "public"."entry_orders" USING "btree" ("plantilla_id");



CREATE INDEX "entry_orders_propietario_id_idx" ON "public"."entry_orders" USING "btree" ("propietario_id");



CREATE INDEX "entry_orders_service_type_idx" ON "public"."entry_orders" USING "btree" ("service_type");



CREATE INDEX "entry_orders_tenant_idx" ON "public"."entry_orders" USING "btree" ("tenant_id");



CREATE INDEX "entry_orders_vehiculo_id_idx" ON "public"."entry_orders" USING "btree" ("vehiculo_id");



CREATE INDEX "ocr_order_id_idx" ON "public"."order_condition_results" USING "btree" ("entry_order_id");



CREATE INDEX "ocr_tenant_id_idx" ON "public"."order_condition_results" USING "btree" ("tenant_id");



CREATE INDEX "order_template_active_not_deleted_idx" ON "public"."order_template" USING "btree" ("is_active") WHERE ("deleted_at" IS NULL);



CREATE INDEX "order_template_created_by_idx" ON "public"."order_template" USING "btree" ("created_by");



CREATE INDEX "order_template_name_trgm_idx" ON "public"."order_template" USING "gin" ("template_name" "public"."gin_trgm_ops");



CREATE INDEX "order_template_signatures_tenant_idx" ON "public"."order_template_signatures" USING "btree" ("tenant_id");



CREATE INDEX "order_template_tenant_id_idx" ON "public"."order_template" USING "btree" ("tenant_id");



CREATE INDEX "os_entry_order_id_idx" ON "public"."order_signatures" USING "btree" ("entry_order_id");



CREATE INDEX "os_template_sig_id_idx" ON "public"."order_signatures" USING "btree" ("template_signature_id");



CREATE INDEX "os_tenant_id_idx" ON "public"."order_signatures" USING "btree" ("tenant_id");



CREATE INDEX "otc_template_id_idx" ON "public"."order_template_conditions" USING "btree" ("order_template_id");



CREATE INDEX "otc_tenant_id_idx" ON "public"."order_template_conditions" USING "btree" ("tenant_id");



CREATE INDEX "personas_nombre_completo_trgm_idx" ON "public"."personas" USING "gin" ("nombre_completo" "public"."gin_trgm_ops");



CREATE INDEX "personas_numero_documento_idx" ON "public"."personas" USING "btree" ("numero_documento");



CREATE INDEX "personas_tenant_idx" ON "public"."personas" USING "btree" ("tenant_id");



CREATE INDEX "service_users_document_number_idx" ON "public"."service_users" USING "btree" ("document_number");



CREATE INDEX "service_users_full_name_trgm_idx" ON "public"."service_users" USING "gin" ("full_name" "public"."gin_trgm_ops");



CREATE INDEX "service_users_is_active_idx" ON "public"."service_users" USING "btree" ("is_active");



CREATE INDEX "signature_conditions_parent_idx" ON "public"."order_template_signature_conditions" USING "btree" ("order_template_signature_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "signature_conditions_tenant_idx" ON "public"."order_template_signature_conditions" USING "btree" ("tenant_id");



CREATE INDEX "tenant_permissions_service_user_id_idx" ON "public"."tenant_permissions" USING "btree" ("service_user_id");



CREATE INDEX "tenant_permissions_tenant_id_idx" ON "public"."tenant_permissions" USING "btree" ("tenant_id");



CREATE INDEX "tenants_created_at_idx" ON "public"."tenants" USING "btree" ("created_at");



CREATE INDEX "tire_pressures_order_idx" ON "public"."entry_order_tire_pressures" USING "btree" ("entry_order_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "tire_pressures_tenant_idx" ON "public"."entry_order_tire_pressures" USING "btree" ("tenant_id");



CREATE INDEX "vehicles_placa_idx" ON "public"."vehicles" USING "btree" ("placa");



CREATE INDEX "vehicles_propietario_idx" ON "public"."vehicles" USING "btree" ("propietario_actual_id");



CREATE INDEX "vehicles_tenant_idx" ON "public"."vehicles" USING "btree" ("tenant_id");



CREATE INDEX "vehicles_tipo_servicio_idx" ON "public"."vehicles" USING "btree" ("tipo_servicio_vehiculo");



CREATE OR REPLACE TRIGGER "on_auth_user_created_or_updated" AFTER INSERT OR UPDATE OF "is_active" ON "public"."service_users" FOR EACH ROW EXECUTE FUNCTION "public"."sync_user_active_status"();



CREATE OR REPLACE TRIGGER "set_entry_order_tire_pressures_updated_at" BEFORE UPDATE ON "public"."entry_order_tire_pressures" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_entry_orders_updated_at" BEFORE UPDATE ON "public"."entry_orders" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_order_condition_results_updated_at" BEFORE UPDATE ON "public"."order_condition_results" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_order_template_conditions_updated_at" BEFORE UPDATE ON "public"."order_template_conditions" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_service_users_updated_at" BEFORE UPDATE ON "public"."service_users" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_tenant_permissions_updated_at" BEFORE UPDATE ON "public"."tenant_permissions" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_tenants_updated_at" BEFORE UPDATE ON "public"."tenants" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "tr_order_template_signature_conditions_updated_at" BEFORE UPDATE ON "public"."order_template_signature_conditions" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "tr_order_template_signatures_updated_at" BEFORE UPDATE ON "public"."order_template_signatures" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "tr_order_template_updated_at" BEFORE UPDATE ON "public"."order_template" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "tr_personas_updated_at" BEFORE UPDATE ON "public"."personas" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "tr_vehicles_updated_at" BEFORE UPDATE ON "public"."vehicles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."entry_orders"
    ADD CONSTRAINT "entry_orders_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."personas"("id");



ALTER TABLE ONLY "public"."entry_orders"
    ADD CONSTRAINT "entry_orders_funcionario_id_fkey" FOREIGN KEY ("funcionario_id") REFERENCES "public"."service_users"("id");



ALTER TABLE ONLY "public"."entry_orders"
    ADD CONSTRAINT "entry_orders_id_reprobado_fkey" FOREIGN KEY ("id_reprobado") REFERENCES "public"."entry_orders"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."entry_orders"
    ADD CONSTRAINT "entry_orders_plantilla_id_fkey" FOREIGN KEY ("plantilla_id") REFERENCES "public"."order_template"("id");



ALTER TABLE ONLY "public"."entry_orders"
    ADD CONSTRAINT "entry_orders_propietario_id_fkey" FOREIGN KEY ("propietario_id") REFERENCES "public"."personas"("id");



ALTER TABLE ONLY "public"."entry_orders"
    ADD CONSTRAINT "entry_orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."entry_orders"
    ADD CONSTRAINT "entry_orders_vehiculo_id_fkey" FOREIGN KEY ("vehiculo_id") REFERENCES "public"."vehicles"("id");



ALTER TABLE ONLY "public"."order_condition_results"
    ADD CONSTRAINT "ocr_order_fkey" FOREIGN KEY ("entry_order_id") REFERENCES "public"."entry_orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_condition_results"
    ADD CONSTRAINT "ocr_tenant_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id");



ALTER TABLE ONLY "public"."order_template_conditions"
    ADD CONSTRAINT "order_template_conditions_template_id_fkey" FOREIGN KEY ("order_template_id") REFERENCES "public"."order_template"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_template_conditions"
    ADD CONSTRAINT "order_template_conditions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_template"
    ADD CONSTRAINT "order_template_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."service_users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."order_template_signatures"
    ADD CONSTRAINT "order_template_signatures_template_id_fkey" FOREIGN KEY ("order_template_id") REFERENCES "public"."order_template"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_template_signatures"
    ADD CONSTRAINT "order_template_signatures_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_template"
    ADD CONSTRAINT "order_template_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_signatures"
    ADD CONSTRAINT "os_order_fkey" FOREIGN KEY ("entry_order_id") REFERENCES "public"."entry_orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_signatures"
    ADD CONSTRAINT "os_template_sig_fkey" FOREIGN KEY ("template_signature_id") REFERENCES "public"."order_template_signatures"("id");



ALTER TABLE ONLY "public"."order_signatures"
    ADD CONSTRAINT "os_tenant_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id");



ALTER TABLE ONLY "public"."personas"
    ADD CONSTRAINT "personas_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_users"
    ADD CONSTRAINT "service_users_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_template_signature_conditions"
    ADD CONSTRAINT "signature_conditions_signature_id_fkey" FOREIGN KEY ("order_template_signature_id") REFERENCES "public"."order_template_signatures"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_template_signature_conditions"
    ADD CONSTRAINT "signature_conditions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tenant_permissions"
    ADD CONSTRAINT "tenant_permissions_service_user_id_fkey" FOREIGN KEY ("service_user_id") REFERENCES "public"."service_users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tenant_permissions"
    ADD CONSTRAINT "tenant_permissions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."entry_order_tire_pressures"
    ADD CONSTRAINT "tire_pressures_order_id_fkey" FOREIGN KEY ("entry_order_id") REFERENCES "public"."entry_orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."entry_order_tire_pressures"
    ADD CONSTRAINT "tire_pressures_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vehicles"
    ADD CONSTRAINT "vehicles_propietario_fkey" FOREIGN KEY ("propietario_actual_id") REFERENCES "public"."personas"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."vehicles"
    ADD CONSTRAINT "vehicles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



CREATE POLICY "Acceso total verificado: JWT + Base de Datos" ON "public"."tenants" FOR SELECT TO "authenticated" USING (((((( SELECT "auth"."jwt"() AS "jwt") -> 'app_metadata'::"text") -> 'tenants'::"text") ? "slug") AND (EXISTS ( SELECT 1
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("tp"."service_user_id" = "su"."id")))
  WHERE (("tp"."tenant_id" = "tenants"."id") AND ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))))));



CREATE POLICY "Users can create condition results for their allowed tenants" ON "public"."order_condition_results" FOR INSERT TO "authenticated" WITH CHECK (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Users can create entry orders for their allowed tenants" ON "public"."entry_orders" FOR INSERT TO "authenticated" WITH CHECK (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Users can create order signatures for their allowed tenants" ON "public"."order_signatures" FOR INSERT TO "authenticated" WITH CHECK (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Users can create template conditions for their allowed tenants" ON "public"."order_template_conditions" FOR INSERT TO "authenticated" WITH CHECK (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Users can create template signature conditions for their allowe" ON "public"."order_template_signature_conditions" FOR INSERT TO "authenticated" WITH CHECK (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Users can create tire pressures for their allowed tenants" ON "public"."entry_order_tire_pressures" FOR INSERT TO "authenticated" WITH CHECK (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Users can delete their own service_user" ON "public"."service_users" FOR DELETE TO "authenticated" USING (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can insert their own service_user" ON "public"."service_users" FOR INSERT TO "authenticated" WITH CHECK (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can read their own service_user" ON "public"."service_users" FOR SELECT TO "authenticated" USING (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can read their tenant memberships" ON "public"."tenant_permissions" FOR SELECT TO "authenticated" USING (("service_user_id" IN ( SELECT "service_users"."id"
   FROM "public"."service_users"
  WHERE ("service_users"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Users can see condition results from their allowed tenants" ON "public"."order_condition_results" FOR SELECT TO "authenticated" USING (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Users can see entry orders from their allowed tenants" ON "public"."entry_orders" FOR SELECT TO "authenticated" USING (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Users can see order signatures from their allowed tenants" ON "public"."order_signatures" FOR SELECT TO "authenticated" USING (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Users can see template conditions from their allowed tenants" ON "public"."order_template_conditions" FOR SELECT TO "authenticated" USING (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Users can see template signature conditions from their allowed " ON "public"."order_template_signature_conditions" FOR SELECT TO "authenticated" USING (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Users can see tire pressures from their allowed tenants" ON "public"."entry_order_tire_pressures" FOR SELECT TO "authenticated" USING (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Users can update condition results from their allowed tenants" ON "public"."order_condition_results" FOR UPDATE TO "authenticated" USING (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid"))))) WITH CHECK (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Users can update entry orders from their allowed tenants" ON "public"."entry_orders" FOR UPDATE TO "authenticated" USING (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid"))))) WITH CHECK (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Users can update order signatures from their allowed tenants" ON "public"."order_signatures" FOR UPDATE TO "authenticated" USING (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid"))))) WITH CHECK (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Users can update template conditions from their allowed tenants" ON "public"."order_template_conditions" FOR UPDATE TO "authenticated" USING (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid"))))) WITH CHECK (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Users can update template signature conditions from their allow" ON "public"."order_template_signature_conditions" FOR UPDATE TO "authenticated" USING (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid"))))) WITH CHECK (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Users can update their own service_user" ON "public"."service_users" FOR UPDATE TO "authenticated" USING (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can update tire pressures from their allowed tenants" ON "public"."entry_order_tire_pressures" FOR UPDATE TO "authenticated" USING (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid"))))) WITH CHECK (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "delete_order_template_by_tenant" ON "public"."order_template" FOR DELETE TO "authenticated" USING (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))));



ALTER TABLE "public"."entry_order_tire_pressures" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."entry_orders" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "insert_order_template_by_tenant" ON "public"."order_template" FOR INSERT TO "authenticated" WITH CHECK (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "insert_order_template_sigs_by_tenant" ON "public"."order_template_signatures" FOR INSERT TO "authenticated" WITH CHECK (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "insert_personas_by_tenant" ON "public"."personas" FOR INSERT TO "authenticated" WITH CHECK (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "insert_vehicles_by_tenant" ON "public"."vehicles" FOR INSERT TO "authenticated" WITH CHECK (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))));



ALTER TABLE "public"."order_condition_results" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_signatures" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_template" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_template_conditions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_template_signature_conditions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_template_signatures" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."personas" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "select_order_template_by_tenant" ON "public"."order_template" FOR SELECT TO "authenticated" USING (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "select_order_template_sigs_by_tenant" ON "public"."order_template_signatures" FOR SELECT TO "authenticated" USING (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "select_personas_by_tenant" ON "public"."personas" FOR SELECT TO "authenticated" USING (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "select_vehicles_by_tenant" ON "public"."vehicles" FOR SELECT TO "authenticated" USING (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))));



ALTER TABLE "public"."service_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tenant_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tenants" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "update_order_template_by_tenant" ON "public"."order_template" FOR UPDATE TO "authenticated" USING (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid"))))) WITH CHECK (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "update_order_template_sigs_by_tenant" ON "public"."order_template_signatures" FOR UPDATE TO "authenticated" USING (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid"))))) WITH CHECK (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "update_personas_by_tenant" ON "public"."personas" FOR UPDATE TO "authenticated" USING (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid"))))) WITH CHECK (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "update_vehicles_by_tenant" ON "public"."vehicles" FOR UPDATE TO "authenticated" USING (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid"))))) WITH CHECK (("tenant_id" IN ( SELECT "tp"."tenant_id"
   FROM ("public"."tenant_permissions" "tp"
     JOIN "public"."service_users" "su" ON (("su"."id" = "tp"."service_user_id")))
  WHERE ("su"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))));



ALTER TABLE "public"."vehicles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "service_role";































































































































































GRANT ALL ON FUNCTION "public"."check_preventiva_reinspection_eligibility"("p_placa" character varying, "p_tenant_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_preventiva_reinspection_eligibility"("p_placa" character varying, "p_tenant_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_preventiva_reinspection_eligibility"("p_placa" character varying, "p_tenant_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_rtm_primera_vez_eligibility"("p_placa" character varying, "p_tenant_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_rtm_primera_vez_eligibility"("p_placa" character varying, "p_tenant_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_rtm_primera_vez_eligibility"("p_placa" character varying, "p_tenant_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_rtm_reinspection_eligibility"("p_placa" character varying, "p_tenant_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_rtm_reinspection_eligibility"("p_placa" character varying, "p_tenant_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_rtm_reinspection_eligibility"("p_placa" character varying, "p_tenant_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_full_order"("p_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_full_order"("p_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_full_order"("p_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_full_order_template"("p_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_full_order_template"("p_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_full_order_template"("p_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."fetch_data_with_placa"("p_placa" "text", "p_tenant_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_data_with_placa"("p_placa" "text", "p_tenant_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_data_with_placa"("p_placa" "text", "p_tenant_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."fetch_entry_order_by_id"("p_order_id" "uuid", "p_tenant_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_entry_order_by_id"("p_order_id" "uuid", "p_tenant_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_entry_order_by_id"("p_order_id" "uuid", "p_tenant_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."fetch_entry_orders_list"("p_tenant_id" "uuid", "p_limit" integer, "p_offset" integer, "p_placa" "text", "p_estado" "public"."order_status_enum", "p_fecha_desde" "date", "p_fecha_hasta" "date", "p_cliente_documento" "text", "p_propietario_documento" "text", "p_order_by_column" "text", "p_order_by_direction" "text", "p_show_deleted" boolean, "p_search_column" "text", "p_search_term" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_entry_orders_list"("p_tenant_id" "uuid", "p_limit" integer, "p_offset" integer, "p_placa" "text", "p_estado" "public"."order_status_enum", "p_fecha_desde" "date", "p_fecha_hasta" "date", "p_cliente_documento" "text", "p_propietario_documento" "text", "p_order_by_column" "text", "p_order_by_direction" "text", "p_show_deleted" boolean, "p_search_column" "text", "p_search_term" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_entry_orders_list"("p_tenant_id" "uuid", "p_limit" integer, "p_offset" integer, "p_placa" "text", "p_estado" "public"."order_status_enum", "p_fecha_desde" "date", "p_fecha_hasta" "date", "p_cliente_documento" "text", "p_propietario_documento" "text", "p_order_by_column" "text", "p_order_by_direction" "text", "p_show_deleted" boolean, "p_search_column" "text", "p_search_term" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."fetch_orders_templates"("p_tenant_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_orders_templates"("p_tenant_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_orders_templates"("p_tenant_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_tenant_data"("p_tenant_slug" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_tenant_data"("p_tenant_slug" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_tenant_data"("p_tenant_slug" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_tenant_name"("p_tenant_slug" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_tenant_name"("p_tenant_slug" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_tenant_name"("p_tenant_slug" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_tenant_roles"("p_tenant_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_tenant_roles"("p_tenant_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_tenant_roles"("p_tenant_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_single_session"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_single_session"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_single_session"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "postgres";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "anon";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."show_limit"() TO "postgres";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_user_active_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_user_active_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_user_active_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_director_tecnico_order"("p_order_id" "uuid", "p_resultado_revision" "text", "p_consecutivo_fur" character varying, "p_consecutivo_rtm" character varying, "p_director_tecnico_tipo_documento_snapshot" "text", "p_director_tecnico_numero_documento_snapshot" character varying, "p_director_tecnico_nombre_snapshot" "text", "p_director_tecnico_firma_base64_snapshot" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_director_tecnico_order"("p_order_id" "uuid", "p_resultado_revision" "text", "p_consecutivo_fur" character varying, "p_consecutivo_rtm" character varying, "p_director_tecnico_tipo_documento_snapshot" "text", "p_director_tecnico_numero_documento_snapshot" character varying, "p_director_tecnico_nombre_snapshot" "text", "p_director_tecnico_firma_base64_snapshot" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_director_tecnico_order"("p_order_id" "uuid", "p_resultado_revision" "text", "p_consecutivo_fur" character varying, "p_consecutivo_rtm" character varying, "p_director_tecnico_tipo_documento_snapshot" "text", "p_director_tecnico_numero_documento_snapshot" character varying, "p_director_tecnico_nombre_snapshot" "text", "p_director_tecnico_firma_base64_snapshot" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_office_order_data"("p_order_id" "uuid", "p_pin" character varying, "p_pago" numeric, "p_consecutivo_factura" character varying, "p_tipo_pago" "text", "p_se_compro_soat" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."update_office_order_data"("p_order_id" "uuid", "p_pin" character varying, "p_pago" numeric, "p_consecutivo_factura" character varying, "p_tipo_pago" "text", "p_se_compro_soat" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_office_order_data"("p_order_id" "uuid", "p_pin" character varying, "p_pago" numeric, "p_consecutivo_factura" character varying, "p_tipo_pago" "text", "p_se_compro_soat" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_office_order_data"("p_order_id" "uuid", "p_pin" character varying, "p_pago" numeric, "p_consecutivo_factura" character varying, "p_tipo_pago" "text", "p_se_compro_soat" boolean, "p_num_aprobacion" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."update_office_order_data"("p_order_id" "uuid", "p_pin" character varying, "p_pago" numeric, "p_consecutivo_factura" character varying, "p_tipo_pago" "text", "p_se_compro_soat" boolean, "p_num_aprobacion" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_office_order_data"("p_order_id" "uuid", "p_pin" character varying, "p_pago" numeric, "p_consecutivo_factura" character varying, "p_tipo_pago" "text", "p_se_compro_soat" boolean, "p_num_aprobacion" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "service_role";


















GRANT ALL ON TABLE "public"."entry_order_tire_pressures" TO "anon";
GRANT ALL ON TABLE "public"."entry_order_tire_pressures" TO "authenticated";
GRANT ALL ON TABLE "public"."entry_order_tire_pressures" TO "service_role";



GRANT ALL ON TABLE "public"."entry_orders" TO "anon";
GRANT ALL ON TABLE "public"."entry_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."entry_orders" TO "service_role";



GRANT ALL ON SEQUENCE "public"."entry_orders_consecutivo_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."entry_orders_consecutivo_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."entry_orders_consecutivo_seq" TO "service_role";



GRANT ALL ON TABLE "public"."order_condition_results" TO "anon";
GRANT ALL ON TABLE "public"."order_condition_results" TO "authenticated";
GRANT ALL ON TABLE "public"."order_condition_results" TO "service_role";



GRANT ALL ON TABLE "public"."order_signatures" TO "anon";
GRANT ALL ON TABLE "public"."order_signatures" TO "authenticated";
GRANT ALL ON TABLE "public"."order_signatures" TO "service_role";



GRANT ALL ON TABLE "public"."order_template" TO "anon";
GRANT ALL ON TABLE "public"."order_template" TO "authenticated";
GRANT ALL ON TABLE "public"."order_template" TO "service_role";



GRANT ALL ON TABLE "public"."order_template_conditions" TO "anon";
GRANT ALL ON TABLE "public"."order_template_conditions" TO "authenticated";
GRANT ALL ON TABLE "public"."order_template_conditions" TO "service_role";



GRANT ALL ON TABLE "public"."order_template_signature_conditions" TO "anon";
GRANT ALL ON TABLE "public"."order_template_signature_conditions" TO "authenticated";
GRANT ALL ON TABLE "public"."order_template_signature_conditions" TO "service_role";



GRANT ALL ON TABLE "public"."order_template_signatures" TO "anon";
GRANT ALL ON TABLE "public"."order_template_signatures" TO "authenticated";
GRANT ALL ON TABLE "public"."order_template_signatures" TO "service_role";



GRANT ALL ON TABLE "public"."personas" TO "anon";
GRANT ALL ON TABLE "public"."personas" TO "authenticated";
GRANT ALL ON TABLE "public"."personas" TO "service_role";



GRANT ALL ON TABLE "public"."service_users" TO "anon";
GRANT ALL ON TABLE "public"."service_users" TO "authenticated";
GRANT ALL ON TABLE "public"."service_users" TO "service_role";



GRANT ALL ON TABLE "public"."tenant_permissions" TO "anon";
GRANT ALL ON TABLE "public"."tenant_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."tenant_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."tenants" TO "anon";
GRANT ALL ON TABLE "public"."tenants" TO "authenticated";
GRANT ALL ON TABLE "public"."tenants" TO "service_role";



GRANT ALL ON TABLE "public"."vehicles" TO "anon";
GRANT ALL ON TABLE "public"."vehicles" TO "authenticated";
GRANT ALL ON TABLE "public"."vehicles" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































