
CREATE OR REPLACE FUNCTION public.fetch_admin_analitics_diary(
    p_tenant_id UUID,
    p_servicio_tipo public.service_type_enum DEFAULT NULL
)
RETURNS TABLE (
    total_rtm_hoy INTEGER,
    total_rtm_rechazados_hoy INTEGER
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_hoy_inicio TIMESTAMPTZ := DATE_TRUNC('day', NOW());
    v_hoy_fin TIMESTAMPTZ := DATE_TRUNC('day', NOW())
        + INTERVAL '1 day';
BEGIN
    -- =========================================================
    -- PASO 1: VALIDAR EL TENANT SOLICITADO
    -- =========================================================

    IF p_tenant_id IS NULL THEN
        RAISE EXCEPTION
            'El tenant seleccionado es obligatorio.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.service_users su
        INNER JOIN public.tenant_permissions tp
            ON tp.service_user_id = su.id
        WHERE su.auth_user_id = (SELECT auth.uid())
          AND su.is_active = true
          AND tp.tenant_id = p_tenant_id
    ) THEN
        RAISE EXCEPTION
            'Acceso denegado: el usuario no tiene permisos para este tenant.';
    END IF;

    -- =========================================================
    -- PASO 2: CALCULAR AMBOS TOTALES
    -- =========================================================

    RETURN QUERY
    SELECT
        COUNT(*) FILTER (
            WHERE eo.resultado_revision IS NULL
               OR eo.resultado_revision IS NOT NULL
        )::INTEGER AS total_rtm_hoy,

        COUNT(*) FILTER (
            WHERE eo.resultado_revision = 'rechazado'
        )::INTEGER AS total_rtm_rechazados_hoy

    FROM public.entry_orders eo
    WHERE eo.tenant_id = p_tenant_id
      AND (
          p_servicio_tipo IS NULL
          OR eo.service_type = p_servicio_tipo
      )
      AND eo.deleted_at IS NULL
      AND (
          eo.es_reinspeccion = false
          OR eo.es_reinspeccion IS NULL
      )
      AND eo.fecha >= v_hoy_inicio
      AND eo.fecha < v_hoy_fin;

END;
$$;

-- =============================================================
-- PERMISOS DE EJECUCIÓN
-- =============================================================

REVOKE ALL ON FUNCTION public.fetch_admin_analitics_diary(
    UUID,
    public.service_type_enum
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.fetch_admin_analitics_diary(
    UUID,
    public.service_type_enum
) TO authenticated;
