-- ==========================================
-- RPC: Obtener créditos y cupos del Tenant
-- ==========================================

CREATE OR REPLACE FUNCTION public.get_tenant_credits(
    p_tenant_id UUID
)
RETURNS TABLE (
    cupo_fupas INTEGER,
    cupo_certificados INTEGER,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY INVOKER -- Usa directamente los permisos y RLS del usuario que invoca
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(tc.cupo_fupas, 0) AS cupo_fupas,
        COALESCE(tc.cupo_certificados, 0) AS cupo_certificados,
        tc.updated_at
    FROM public.tenant_credits tc
    WHERE tc.tenant_id = p_tenant_id;

    -- Si no se encuentra fila o el RLS bloquea el acceso, retorna fila con 0 por defecto
    IF NOT FOUND THEN
        RETURN QUERY SELECT 0 AS cupo_fupas, 0 AS cupo_certificados, NOW() AS updated_at;
    END IF;
END;
$$;

COMMENT ON FUNCTION public.get_tenant_credits(UUID) IS 'Retorna el saldo actual de FUPAS y Certificados RUNT para un CDA/Tenant específico.';