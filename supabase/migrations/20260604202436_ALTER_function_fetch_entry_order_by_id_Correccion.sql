-- 1. ELIMINAR LA FUNCIÓN EXISTENTE PARA PODER CAMBIAR EL RETURNS TABLE
DROP FUNCTION IF EXISTS public.fetch_entry_order_by_id(UUID, UUID);

-- 2. CREAR LA FUNCIÓN EXACTAMENTE COMO LA TENÍAS
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

    -- Atributos Técnicos del Vehículo Asociado (AHORA DESDE EL SNAPSHOT - INMUTABLE)
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

    -- Snapshots de Personas (Nuevos campos para eliminar dependencias externas en el PDF)
    propietario_nombre TEXT,
    propietario_documento TEXT,
    propietario_tipo_documento TEXT,
    cliente_nombre TEXT,
    cliente_documento TEXT,
    cliente_tipo_documento TEXT,
    funcionario_nombre TEXT,
    funcionario_documento TEXT,
    funcionario_firma TEXT, -- Nueva columna añadida

    -- Colecciones de Datos Detalle
    presiones_llantas JSONB,
    condiciones_plantilla JSONB,
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