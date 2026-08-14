-- ============================================================
-- 1. ELIMINAR RPC ANTERIOR
-- ============================================================

DROP FUNCTION IF EXISTS public.fetch_sarlaft_evidence_by_entry_order_id(UUID);


-- ============================================================
-- RPC: Obtener evidencias SARLAFT de una orden de entrada
-- incluyendo la firma del cliente
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

    -- Firma del cliente.
    cliente_firma_url TEXT
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

        -- ====================================================
        -- Primera firma registrada para la orden.
        -- La primera corresponde al cliente.
        -- ====================================================
        (
            SELECT os.signature_url
            FROM public.order_signatures os
            WHERE os.entry_order_id = sm.entry_order_id
            ORDER BY os.created_at ASC, os.id ASC
            LIMIT 1
        ) AS cliente_firma_url

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