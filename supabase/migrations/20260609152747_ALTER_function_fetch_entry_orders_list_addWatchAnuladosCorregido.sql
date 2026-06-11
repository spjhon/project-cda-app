

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
    p_search_term TEXT DEFAULT NULL, -- (Lo conectaremos en el siguiente paso)
    p_show_deleted BOOLEAN DEFAULT FALSE -- 🌟 NUEVO PARÁMETRO (Por defecto NO los muestra)
)
RETURNS TABLE (
    id UUID,
    placa TEXT,
    fecha TIMESTAMPTZ,
    marca TEXT,
    linea TEXT,
    propietario_nombre TEXT,
    propietario_documento TEXT,
    cliente_nombre TEXT,
    cliente_documento TEXT,
    estado_orden public.order_status_enum,
    total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- 💡 SOLO UN RETURN: Todo el query se vuelve un string dentro de format()
    RETURN QUERY EXECUTE format('
        SELECT
            o.id,
            o.vehiculo_placa_snapshot::TEXT,
            o.fecha,
            o.vehiculo_marca_snapshot::TEXT,
            o.vehiculo_linea_snapshot::TEXT,
            o.propietario_nombre_snapshot,
            o.propietario_numero_documento_snapshot::TEXT,
            o.cliente_nombre_snapshot,
            o.cliente_numero_documento_snapshot::TEXT,
            o.estado_orden,
            COUNT(*) OVER() AS total_count
        FROM public.entry_orders o
        WHERE
         -- AISLAMIENTO MULTI-TENANT (Solo validamos el soft delete de la orden)
            o.tenant_id = $1
            
            -- 🌟 NUEVO: Si porcentaje con el 10 es TRUE muestra todo, si es FALSE exige que deleted_at sea NULL
            AND ($10 = TRUE OR o.deleted_at IS NULL)

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
            
        -- 🌟 El ordenamiento se inyecta dinámicamente aquí antes de paginar
        ORDER BY %I %s
        
        LIMIT $8 OFFSET $9

        --la I con el simbolo de porcentaje (Identificador): Le dice a la función: "Toma el string que te pasé (p_order_by_column) y escríbelo aquí como una columna real de la tabla, poniéndole comillas dobles si es necesario".
    ', p_order_by_column, p_order_by_direction)
    USING 
        p_tenant_id,            -- $1
        p_placa,                -- $2
        p_estado,               -- $3
        p_fecha_desde,          -- $4
        p_fecha_hasta,          -- $5
        p_cliente_documento,    -- $6
        p_propietario_documento,  -- $7
        p_limit,                -- $8
        p_offset,               -- $9
        p_show_deleted;         -- $10 🌟 $10 ADICIONADO AL FINAL DEL USING
END;
$$;