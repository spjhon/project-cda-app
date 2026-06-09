DROP FUNCTION IF EXISTS public.fetch_entry_orders_list(
    uuid,      -- p_tenant_id
    integer,   -- p_limit
    integer,   -- p_offset
    text,      -- p_placa
    public.order_status_enum, -- p_estado
    date,      -- p_fecha_desde
    date,      -- p_fecha_hasta
    text,      -- p_cliente_documento
    text       -- p_propietario_documento
);



CREATE OR REPLACE FUNCTION public.fetch_entry_orders_list(
    -- Tenant obligatorio para aislamiento multiempresa
    p_tenant_id UUID,

    -- Cuántos registros traer
    p_limit INTEGER DEFAULT 20,

    -- Desde qué posición empezar (paginación)
    p_offset INTEGER DEFAULT 0,

    -- Filtros opcionales
    p_placa TEXT DEFAULT NULL,
    p_estado public.order_status_enum DEFAULT NULL,

    p_fecha_desde DATE DEFAULT CURRENT_DATE,
    p_fecha_hasta DATE DEFAULT CURRENT_DATE,

    p_cliente_documento TEXT DEFAULT NULL,
    p_propietario_documento TEXT DEFAULT NULL,

    --filtros para el ordenamiento
    p_order_by_column TEXT DEFAULT 'fecha',
    p_order_by_direction TEXT DEFAULT 'DESC',

    -- 🌟 NUEVO FILTRO GLOBAL (OPCIONAL)
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
    RETURN QUERY
    SELECT
        -- =====================================================================
        -- TODO SE SACA DIRECTAMENTE DESDE LA TABLA DE ORDENES (GRACIAS A LOS SNAPSHOTS)
        -- =====================================================================
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
        
        -- Conteo total eficiente usando función de ventana
        COUNT(*) OVER() AS total_count

    FROM public.entry_orders o
    WHERE
        -- AISLAMIENTO MULTI-TENANT (Solo validamos el soft delete de la orden)
        o.tenant_id = p_tenant_id
        AND o.deleted_at IS NULL
        
        -- FILTRO POR PLACA (Sobre el Snapshot)
        AND (p_placa IS NULL OR o.vehiculo_placa_snapshot ILIKE '%' || TRIM(p_placa) || '%')
        
        -- FILTRO POR ESTADO
        AND (p_estado IS NULL OR o.estado_orden = p_estado)
        
        -- FILTROS DE FECHAS
        AND o.fecha::DATE >= p_fecha_desde
        AND o.fecha::DATE <= p_fecha_hasta
        
        -- FILTRO DOCUMENTO CLIENTE (Sobre el Snapshot)
        AND (p_cliente_documento IS NULL OR o.cliente_numero_documento_snapshot ILIKE '%' || TRIM(p_cliente_documento) || '%')
        
        -- FILTRO DOCUMENTO PROPIETARIO (Sobre el Snapshot)
        AND (p_propietario_documento IS NULL OR o.propietario_numero_documento_snapshot ILIKE '%' || TRIM(p_propietario_documento) || '%')

    -- Más recientes primero
    ORDER BY o.fecha DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;