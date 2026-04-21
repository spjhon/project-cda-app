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
    service_type public.service_type_enum
) 
LANGUAGE plpgsql
SECURITY DEFINER -- Permite que la función acceda a la tabla incluso con RLS estricto
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
        t.service_type
    FROM order_template t
    WHERE t.tenant_id = p_tenant_id
      AND t.deleted_at IS NULL -- Filtramos los eliminados lógicamente
    ORDER BY t.created_at DESC;
END;
$$;