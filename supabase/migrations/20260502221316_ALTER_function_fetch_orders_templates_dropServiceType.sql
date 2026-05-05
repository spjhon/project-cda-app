DROP FUNCTION IF EXISTS public.fetch_orders_templates(uuid);

CREATE OR REPLACE FUNCTION fetch_orders_templates(p_tenant_id UUID)
RETURNS TABLE (
    id UUID,
    tenant_id UUID,
    template_name TEXT,
    version INTEGER,
    is_active BOOLEAN,
    document_date DATE,
    document_code TEXT,
    logo_url TEXT,
    base_contract_text TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    created_by UUID,
    conditions JSONB,
    signatures JSONB 
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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