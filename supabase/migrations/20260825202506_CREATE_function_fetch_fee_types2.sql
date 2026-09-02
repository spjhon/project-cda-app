-- ============================================================
-- RPC: OBTENER FEES DEL CATÁLOGO
-- ============================================================

CREATE OR REPLACE FUNCTION public.fetch_fee_types(
    p_tenant_id UUID
)
RETURNS TABLE (
    id UUID,
    tenant_id UUID,
    name TEXT,
    code TEXT,
    description TEXT,
    fee_amount NUMERIC(12,2),
    model_year_from INTEGER,
    model_year_to INTEGER,
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$

    SELECT
        ft.id,
        ft.tenant_id,
        ft.name,
        ft.code,
        ft.description,
        ft.fee_amount,
        ft.model_year_from,
        ft.model_year_to,
        ft.is_active,
        ft.created_at,
        ft.updated_at

    FROM public.fee_types AS ft

    WHERE ft.tenant_id = p_tenant_id

    ORDER BY
        ft.is_active DESC,
        ft.name,
        ft.created_at DESC;

$$;