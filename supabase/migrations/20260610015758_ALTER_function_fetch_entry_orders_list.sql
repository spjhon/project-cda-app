-- 🗑️ BORRAR LA FUNCIÓN ANTERIOR (Obligatorio porque cambiaron los parámetros de entrada)
DROP FUNCTION IF EXISTS public.fetch_entry_orders_list(
    UUID,     -- p_tenant_id
    INTEGER,  -- p_limit
    INTEGER,  -- p_offset
    TEXT,     -- p_placa
    public.order_status_enum, -- p_estado
    DATE,     -- p_fecha_desde
    DATE,     -- p_fecha_hasta
    TEXT,     -- p_cliente_documento
    TEXT,     -- p_propietario_documento
    TEXT,     -- p_order_by_column
    TEXT,     -- p_order_by_direction
    TEXT,     -- p_search_term (El parámetro que tenías antes de este cambio)
    BOOLEAN   -- p_show_deleted
);

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
    p_show_deleted BOOLEAN DEFAULT FALSE, -- 🌟 NUEVO PARÁMETRO (Por defecto NO los muestra)
    -- 🌟 PARÁMETROS NUEVOS PARA EL BUSCADOR AVANZADO
    p_search_column TEXT DEFAULT NULL,   -- Recibe la columna del Select: 'placa', 'marca', 'linea', 'doc_cliente', 'doc_propietario'
    p_search_term TEXT DEFAULT NULL      -- Recibe el texto que la recepcionista digita en el Input
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
$$;