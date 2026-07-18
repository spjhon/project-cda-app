CREATE OR REPLACE FUNCTION public.fetch_service_requirements_list(
    p_tenant_id UUID,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0,
    p_fecha_desde DATE DEFAULT CURRENT_DATE,
    p_fecha_hasta DATE DEFAULT CURRENT_DATE,
    p_order_by_column TEXT DEFAULT 'created_at',
    p_order_by_direction TEXT DEFAULT 'DESC',
    p_search_column TEXT DEFAULT NULL,
    p_search_term TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    tenant_id UUID,
    sender_name TEXT,
    sender_email TEXT,
    sender_phone TEXT,
    placa CHARACTER VARYING(10),
    description TEXT,
    requirement_type TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    total_count BIGINT
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_order_col TEXT;
BEGIN
    -- Mapeo y validación estricta para el ORDER BY basado en tu SELECT_COLUMNAS
    v_order_col := CASE p_order_by_column
        WHEN 'created_at' THEN 'created_at'
        WHEN 'requirement_type' THEN 'requirement_type'
        WHEN 'status' THEN 'status'
        WHEN 'updated_at' THEN 'updated_at'
        ELSE 'created_at' -- Fallback seguro si viene nulo o vacío
    END;

    RETURN QUERY EXECUTE format('
        SELECT
            sr.id,
            sr.tenant_id,
            sr.sender_name,
            sr.sender_email,
            sr.sender_phone,
            sr.placa,
            sr.description,
            sr.requirement_type,
            sr.status,
            sr.created_at,
            sr.updated_at,
            COUNT(*) OVER() AS total_count
        FROM public.service_requirements sr
        WHERE
            -- AISLAMIENTO MULTI-TENANT
            sr.tenant_id = $1
            
            -- FILTROS DE FECHAS (Sobre created_at)
            AND sr.created_at::DATE >= $2
            AND sr.created_at::DATE <= $3
            
            -- BÚSQUEDA DINÁMICA DE ACUERDO A TU SELECT_COLUMNAS
            AND (
                $5 IS NULL OR TRIM($5) = '''' 
                OR (
                    CASE $4
                        WHEN ''created_at'' THEN sr.created_at::TEXT ILIKE ''%%'' || TRIM($5) || ''%%''
                        WHEN ''requirement_type'' THEN sr.requirement_type ILIKE ''%%'' || TRIM($5) || ''%%''
                        WHEN ''status'' THEN sr.status ILIKE ''%%'' || TRIM($5) || ''%%''
                        WHEN ''updated_at'' THEN sr.updated_at::TEXT ILIKE ''%%'' || TRIM($5) || ''%%''
                        ELSE FALSE
                    END
                )
            )
            
        ORDER BY sr.%I %s
        LIMIT $6 OFFSET $7
    ', v_order_col, p_order_by_direction)
    USING 
        p_tenant_id,           -- $1
        p_fecha_desde,         -- $2
        p_fecha_hasta,         -- $3
        p_search_column,       -- $4
        p_search_term,         -- $5
        p_limit,               -- $6
        p_offset;              -- $7
END;
$$;