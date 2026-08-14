-- ============================================================
-- RPC: Obtener evidencias SARLAFT de una orden de entrada
-- ============================================================

CREATE OR REPLACE FUNCTION public.fetch_sarlaft_evidence_by_entry_order_id(
    p_entry_order_id UUID
)
RETURNS TABLE (
    id UUID,
    tenant_id UUID,
    entry_order_id UUID,
    person_type TEXT,

    placa_snapshot VARCHAR,
    nombre_completo_snapshot TEXT,
    tipo_documento_snapshot TEXT,
    numero_documento_snapshot VARCHAR,

    actividad_economica_snapshot TEXT,
    origen_fondos_snapshot TEXT,
    es_persona_publicamente_expuesta_snapshot BOOLEAN,

    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN

    RETURN QUERY
    SELECT
        sm.id,
        sm.tenant_id,
        sm.entry_order_id,
        sm.person_type,

        sm.placa_snapshot,
        sm.nombre_completo_snapshot,
        sm.tipo_documento_snapshot,
        sm.numero_documento_snapshot,

        sm.actividad_economica_snapshot,
        sm.origen_fondos_snapshot,
        sm.es_persona_publicamente_expuesta_snapshot,

        sm.created_at,
        sm.updated_at

    FROM public.sarlaft_module sm
    WHERE sm.entry_order_id = p_entry_order_id
    ORDER BY
        CASE sm.person_type
            WHEN 'customer' THEN 1
            WHEN 'owner' THEN 2
            ELSE 3
        END;

END;
$$;