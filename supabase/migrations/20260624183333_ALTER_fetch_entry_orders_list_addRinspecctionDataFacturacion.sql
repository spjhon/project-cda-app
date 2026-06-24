CREATE OR REPLACE FUNCTION public.fetch_entry_orders_list(
    p_tenant_id UUID,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0,
    p_placa TEXT DEFAULT NULL,
    p_estado public.order_status_enum DEFAULT NULL,
    p_fecha_desde DATE DEFAULT CURRENT_DATE,
    p_fecha_hasta DATE DEFAULT CURRENT_DATE,
    p_cliente_documento TEXT DEFAULT NULL,
    p_propietario_documento TEXT DEFAULT NULL, 
    p_order_by_column TEXT DEFAULT 'fecha',
    p_order_by_direction TEXT DEFAULT 'DESC',
    p_show_deleted BOOLEAN DEFAULT FALSE,
    p_search_column TEXT DEFAULT NULL,
    p_search_term TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    placa TEXT,
    fecha TIMESTAMPTZ,
    marca TEXT,
    linea TEXT,
    propietario_nombre TEXT,
    propietario_documento TEXT,
    propietario_tipo_documento TEXT,
    cliente_nombre TEXT,
    cliente_documento TEXT,
    cliente_tipo_documento TEXT,
    es_reinspeccion BOOLEAN,
    kilometraje CHARACTER VARYING,
    soat_vencimiento_snapshot DATE,
    service_type public.service_type_enum,
    vehiculo_tipo_snapshot public.vehicle_type_enum,
    vehiculo_tipo_servicio_snapshot public.vehicle_service_type_enum,
    estado_orden public.order_status_enum,
    
    oficina_pin CHARACTER VARYING,
    oficina_pago NUMERIC(12,2),
    oficina_consecutivo_factura CHARACTER VARYING,
    oficina_tipo_pago public.office_payment_type_enum,
    oficina_num_aprobacion CHARACTER VARYING,
    se_compro_soat BOOLEAN,
    
    resultado_revision TEXT,
    consecutivo_fur CHARACTER VARYING,
    consecutivo_rtm CHARACTER VARYING,
    total_count BIGINT
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY EXECUTE format('
        SELECT
            o.id,
            o.vehiculo_placa_snapshot::TEXT AS placa,
            o.fecha,
            o.vehiculo_marca_snapshot::TEXT AS marca,
            o.vehiculo_linea_snapshot::TEXT AS linea,
            o.propietario_nombre_snapshot AS propietario_nombre,
            o.propietario_numero_documento_snapshot::TEXT AS propietario_documento,
            o.propietario_tipo_documento_snapshot::TEXT AS propietario_tipo_documento,
            o.cliente_nombre_snapshot AS cliente_nombre,
            o.cliente_numero_documento_snapshot::TEXT AS cliente_documento,
            o.cliente_tipo_documento_snapshot::TEXT AS cliente_tipo_documento,
            o.es_reinspeccion,
            o.kilometraje,
            o.soat_vencimiento_snapshot,
            o.service_type,
            o.vehiculo_tipo_snapshot,
            o.vehiculo_tipo_servicio_snapshot,
            o.estado_orden,
            
            -- 🌟 INICIO BLOQUE REINSPECCIÓN (Reemplazo dinámico de datos de oficina)
            CASE WHEN o.es_reinspeccion = TRUE THEN old_o.oficina_pin ELSE o.oficina_pin END AS oficina_pin,
            CASE WHEN o.es_reinspeccion = TRUE THEN old_o.oficina_pago ELSE o.oficina_pago END AS oficina_pago,
            CASE WHEN o.es_reinspeccion = TRUE THEN old_o.oficina_consecutivo_factura ELSE o.oficina_consecutivo_factura END AS oficina_consecutivo_factura,
            CASE WHEN o.es_reinspeccion = TRUE THEN old_o.oficina_tipo_pago ELSE o.oficina_tipo_pago END AS oficina_tipo_pago,
            CASE WHEN o.es_reinspeccion = TRUE THEN old_o.oficina_num_aprobacion ELSE o.oficina_num_aprobacion END AS oficina_num_aprobacion,
            CASE WHEN o.es_reinspeccion = TRUE THEN old_o.se_compro_soat ELSE o.se_compro_soat END AS se_compro_soat,
            -- 🌟 FIN BLOQUE REINSPECCIÓN

            o.resultado_revision,
            o.consecutivo_fur,
            o.consecutivo_rtm,
            COUNT(*) OVER() AS total_count
        FROM public.entry_orders o
        
        -- 🌟 INICIO BLOQUE REINSPECCIÓN (Conexión con la orden vieja)
        -- Traemos los datos de la orden vieja solo si esta tiene un id_reprobado
        LEFT JOIN public.entry_orders old_o ON o.id_reprobado = old_o.id
        -- 🌟 FIN BLOQUE REINSPECCIÓN

        WHERE
            -- AISLAMIENTO MULTI-TENANT
            o.tenant_id = $1
            
            -- FILTRO DE ANULADAS
            AND ($10 = TRUE OR o.estado_orden != ''anulada''::public.order_status_enum)

            -- FILTRO POR PLACA
            AND ($2 IS NULL OR o.vehiculo_placa_snapshot ILIKE ''%%'' || TRIM($2) || ''%%'')

            -- FILTRO POR ESTADO
            AND ($3 IS NULL OR o.estado_orden = $3)

            -- FILTROS DE FECHAS
            AND o.fecha::DATE >= $4
            AND o.fecha::DATE <= $5

            -- FILTRO DOCUMENTO CLIENTE
            AND ($6 IS NULL OR o.cliente_numero_documento_snapshot ILIKE ''%%'' || TRIM($6) || ''%%'')

            -- FILTRO DOCUMENTO PROPIETARIO
            AND ($7 IS NULL OR o.propietario_numero_documento_snapshot ILIKE ''%%'' || TRIM($7) || ''%%'')
            
            -- BÚSQUEDA EXCLUSIVA POR COLUMNA SELECCIONADA
            AND (
                $12 IS NULL OR TRIM($12) = '''' 
                OR (
                    CASE $11
                        WHEN ''placa'' THEN o.vehiculo_placa_snapshot ILIKE ''%%'' || TRIM($12) || ''%%''
                        WHEN ''marca'' THEN o.vehiculo_marca_snapshot ILIKE ''%%'' || TRIM($12) || ''%%''
                        WHEN ''linea'' THEN o.vehiculo_linea_snapshot ILIKE ''%%'' || TRIM($12) || ''%%''
                        WHEN ''doc_cliente'' THEN o.cliente_numero_documento_snapshot ILIKE ''%%'' || TRIM($12) || ''%%''
                        WHEN ''doc_propietario'' THEN o.propietario_numero_documento_snapshot ILIKE ''%%'' || TRIM($12) || ''%%''
                        ELSE FALSE
                    END
                )
            )
            
        ORDER BY %I %s
        LIMIT $8 OFFSET $9
    ', p_order_by_column, p_order_by_direction)
    USING 
        p_tenant_id,            -- $1
        p_placa,                -- $2
        p_estado,               -- $3
        p_fecha_desde,          -- $4
        p_fecha_hasta,          -- $5
        p_cliente_documento,    -- $6
        p_propietario_documento,-- $7
        p_limit,                -- $8
        p_offset,               -- $9
        p_show_deleted,         -- $10
        p_search_column,        -- $11
        p_search_term;          -- $12
END;
$$;