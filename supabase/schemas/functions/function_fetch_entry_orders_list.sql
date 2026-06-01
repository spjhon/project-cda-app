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
    p_propietario_documento TEXT DEFAULT NULL

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
        -- ============================
        -- DATOS PRINCIPALES DE LA ORDEN
        -- ============================
        o.id,
        v.placa::TEXT,
        o.fecha,
        v.marca::TEXT,
        v.linea::TEXT,
        -- ============================
        -- DATOS DEL PROPIETARIO
        -- ============================
        propietario.nombre_completo,
        propietario.numero_documento::TEXT,
        -- ============================
        -- DATOS DEL CLIENTE
        -- ============================
        cliente.nombre_completo,
        cliente.numero_documento::TEXT,
        -- ============================
        -- ESTADO
        -- ============================
        o.estado_orden,
	-- ============================
        -- CONTEO TOTAL
        -- ============================
	COUNT(*) OVER() AS total_count

    FROM public.entry_orders o
    -- ============================
    -- JOIN VEHÍCULO
    -- ============================
    INNER JOIN public.vehicles v
        ON v.id = o.vehiculo_id
    -- ============================
    -- JOIN PROPIETARIO
    -- ============================
    INNER JOIN public.personas propietario
        ON propietario.id = o.propietario_id
    -- ============================
    -- JOIN CLIENTE
    -- ============================
    INNER JOIN public.personas cliente
        ON cliente.id = o.cliente_id
    WHERE
        -- ==========================================
        -- AISLAMIENTO MULTI-TENANT
        -- ==========================================
        o.tenant_id = p_tenant_id
        -- ==========================================
        -- SOFT DELETE
        -- ==========================================
        AND o.deleted_at IS NULL
        AND v.deleted_at IS NULL
        AND propietario.deleted_at IS NULL
        AND cliente.deleted_at IS NULL
        -- ==========================================
        -- FILTRO POR PLACA
        -- Si viene NULL, no filtra
	-- con que una de las dos condiciones sea verdadera, pasa.
-- PARA ENTENDER MEJOR LA LOGICA DE ESTA CONDICIONAL: si se coloca solo AND (true), es redundante, pero si alguno de los or da true (esto v.placa ILIKE '%' || TRIM(p_placa) || '%', es un lado del null, entonces la condición pasa y la fila se inyecta en lo que se va a devolver
        -- ==========================================
        AND (p_placa IS NULL OR v.placa ILIKE '%' || TRIM(p_placa) || '%')
        -- ==========================================
        -- FILTRO POR ESTADO
        -- ==========================================
        AND ( p_estado IS NULL OR o.estado_orden = p_estado)
        -- ==========================================
        -- FILTRO FECHA DESDE
        -- ==========================================
        AND o.fecha::DATE >= p_fecha_desde
        -- ==========================================
        -- FILTRO FECHA HASTA
        -- ==========================================
        AND o.fecha::DATE <= p_fecha_hasta
        -- ==========================================
        -- FILTRO DOCUMENTO CLIENTE
        -- ==========================================
        AND (p_cliente_documento IS NULL OR cliente.numero_documento ILIKE '%' || TRIM(p_cliente_documento) || '%')
        -- ==========================================
        -- FILTRO DOCUMENTO PROPIETARIO
        -- ==========================================
        AND ( p_propietario_documento IS NULL OR propietario.numero_documento ILIKE '%' || TRIM(p_propietario_documento) || '%')
    -- Más recientes primero
    ORDER BY o.fecha DESC
    -- Paginación
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;