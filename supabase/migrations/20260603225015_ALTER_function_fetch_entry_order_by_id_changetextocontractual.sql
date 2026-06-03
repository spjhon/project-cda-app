-- ============================================================================
-- 1. LIMPIEZA DE LA FUNCIÓN ANTERIOR (Para evitar conflictos de firmas)
-- ============================================================================
DROP FUNCTION IF EXISTS public.fetch_entry_order_by_id(UUID, UUID);

-- ============================================================================
-- 2. CREACIÓN DE LA FUNCIÓN MULTI-TENANT OPTIMIZADA
-- ============================================================================
CREATE OR REPLACE FUNCTION public.fetch_entry_order_by_id(
    p_order_id UUID,
    p_tenant_id UUID DEFAULT NULL
)
RETURNS TABLE (
    -- Datos principales de la Orden de Entrada
    id UUID,
    tenant_id UUID,
    consecutivo INTEGER,
    fecha TIMESTAMPTZ,
    kilometraje VARCHAR,
    es_reinspeccion BOOLEAN,
    observaciones TEXT,
    estado_orden order_status_enum,
    soat_vencimiento_snapshot DATE,
    gas_numero_snapshot VARCHAR,
    gas_vencimiento_snapshot DATE,
    
    service_type service_type_enum,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    
    -- Identificadores de relaciones relativas a la orden
    vehiculo_id UUID,
    propietario_id UUID,
    cliente_id UUID,
    funcionario_id UUID,
    plantilla_id UUID,

    -- Datos de la Plantilla (Control de Calidad / Encabezado PDF)
    plantilla_nombre TEXT,
    plantilla_version INTEGER,
    plantilla_fecha_documento DATE,
    plantilla_codigo_documento TEXT,
    plantilla_logo_url TEXT,
    plantilla_texto_contractual TEXT,

    -- Atributos Técnicos del Vehículo Asociado
    vehiculo_placa VARCHAR,
    vehiculo_marca VARCHAR,
    vehiculo_linea VARCHAR,
    vehiculo_modelo INTEGER,
    vehiculo_color VARCHAR,
    vehiculo_tipo_vehiculo public.vehicle_type_enum,
    vehiculo_clase VARCHAR,
    vehiculo_combustible VARCHAR,
    vehiculo_cilindrada INTEGER,
    vehiculo_blindaje BOOLEAN,
    vehiculo_capacidad_pasajeros INTEGER,
    vehiculo_es_ensenanza BOOLEAN,
    vehiculo_tipo_servicio_vehiculo public.vehicle_service_type_enum,
    vehiculo_es_extranjero BOOLEAN,

    -- Colección de Mediciones de Presión
    presiones_llantas JSONB,

    -- Estructura de condiciones de inspección configuradas en el formato
    condiciones_plantilla JSONB,

    -- 🔥 NUEVO CAMPO: Colección ordenada de firmas requeridas y capturadas
    firmas_orden JSONB
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
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
        
        -- Bloque: Metadatos del Formato / Plantilla
        t.template_name AS plantilla_nombre,
        t.version AS plantilla_version,
        t.document_date AS plantilla_fecha_documento,
        t.document_code AS plantilla_codigo_documento,
        t.logo_url AS plantilla_logo_url,
        t.base_contract_text as plantilla_texto_contractual,

        -- Bloque: Especificaciones del Vehículo
        v.placa AS vehiculo_placa,
        v.marca AS vehiculo_marca,
        v.linea AS vehiculo_linea,
        v.modelo AS vehiculo_modelo,
        v.color AS vehiculo_color,
        v.tipo_vehiculo AS vehiculo_tipo_vehiculo,
        v.clase AS vehiculo_clase,
        v.combustible AS vehiculo_combustible,
        v.cilindrada AS vehiculo_cilindrada,
        v.blindaje AS vehiculo_blindaje,
        v.capacidad_pasajeros AS vehiculo_capacidad_pasajeros,
        v.es_ensenanza AS vehiculo_es_ensenanza,
        v.tipo_servicio_vehiculo AS vehiculo_tipo_servicio_vehiculo,
        v.es_extranjero AS vehiculo_es_extranjero,
        
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

        -- Bloque Subconsulta: Lista ordenada de condiciones de control
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', tc.id,
                    'label', tc.label,
                    'is_special', tc.is_special,
                    'special_condition_label', tc.special_condition_label,
                    'value', CASE 
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

        -- 🔥 Bloque Subconsulta 3: Extracción e Inferencia de Firmas con Textos Legales
        -- --------------------------------------------------------------------
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'template_signature_id', ots.id,
                    'representative_type', ots.representative_type,
                    'signature_label', ots.signature_label,
                    
                    -- Si la orden ya fue firmada, trae la URL de Supabase Storage, si no, NULL
                    'signature_url', os.signature_url,
                    
                    -- Traemos la declaración de responsabilidad mapeada a esta firma específica
                    'declaration_text', os_cond.declaration_text
                )
                ORDER BY ots.created_at ASC
            )
            FROM public.order_template_signatures ots
            
            -- 1. Buscamos la firma física guardada de esta orden
            LEFT JOIN public.order_signatures os
                ON os.template_signature_id = ots.id
               AND os.entry_order_id = o.id
               AND os.tenant_id = o.tenant_id
               
            -- 2. Buscamos el texto legal anidado a este tipo de firma en la plantilla
            LEFT JOIN public.order_template_signature_conditions os_cond
                ON os_cond.order_template_signature_id = ots.id
               AND os_cond.tenant_id = o.tenant_id
               AND os_cond.deleted_at IS NULL
               
            WHERE ots.order_template_id = o.plantilla_id
              AND ots.tenant_id = o.tenant_id
              AND ots.deleted_at IS NULL
        ) AS firmas_orden

    FROM public.entry_orders o
    
    LEFT JOIN public.order_template t 
        ON o.plantilla_id = t.id 
        AND t.deleted_at IS NULL
        
    LEFT JOIN public.vehicles v
        ON o.vehiculo_id = v.id
        AND v.deleted_at IS NULL
        
    WHERE o.id = p_order_id
      AND o.tenant_id = p_tenant_id
      AND o.deleted_at IS NULL;
END;
$$;