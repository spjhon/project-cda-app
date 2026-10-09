CREATE OR REPLACE FUNCTION public.get_analitica_personalizada(
    p_fecha_inicio date DEFAULT NULL,
    p_fecha_fin date DEFAULT NULL,
    p_vehicle_type public.vehicle_type_enum DEFAULT NULL,
    p_result text DEFAULT NULL,
    p_service_type public.service_type_enum DEFAULT NULL,
    p_soat_purchased text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_tenant_id uuid;
    v_hoy date := (now() AT TIME ZONE 'America/Bogota')::date;
    v_inicio_hoy timestamptz;
    v_inicio_manana timestamptz;
    v_total_historico integer := 0;
    v_total_hoy integer := 0;
BEGIN
    -- =========================================================
    -- PASO 1: VALIDACIÓN DE TENANT
    -- =========================================================

    SELECT tp.tenant_id
    INTO v_tenant_id
    FROM public.service_users su
    INNER JOIN public.tenant_permissions tp
        ON tp.service_user_id = su.id
    WHERE su.auth_user_id = auth.uid()
      AND su.is_active = true
    LIMIT 1;

    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION
            'Acceso denegado: Usuario no vinculado a un tenant activo.';
    END IF;

    -- =========================================================
    -- PASO 2: LÍMITES DEL DÍA ACTUAL EN COLOMBIA
    -- =========================================================

    v_inicio_hoy :=
        v_hoy::timestamp AT TIME ZONE 'America/Bogota';

    v_inicio_manana :=
        (v_hoy + 1)::timestamp AT TIME ZONE 'America/Bogota';

    -- =========================================================
    -- PASO 3: CONSULTAR LA VISTA MATERIALIZADA
    -- Solo fechas anteriores a hoy
    -- =========================================================

    SELECT COALESCE(SUM(m.cantidad), 0)::integer
    INTO v_total_historico
    FROM public.mv_reportes_diarios m
    WHERE m.tenant_id = v_tenant_id

      -- Evitar incluir el día actual en esta fuente
      AND m.fecha < v_hoy

      -- Filtros de rango de fechas
      AND (p_fecha_inicio IS NULL OR m.fecha >= p_fecha_inicio)
      AND (p_fecha_fin IS NULL OR m.fecha <= p_fecha_fin)

      -- Filtro por tipo de vehículo
      AND (
          p_vehicle_type IS NULL
          OR m.vehiculo_tipo_snapshot = p_vehicle_type
      )

      -- Filtro por resultado
      AND (
          p_result IS NULL
          OR m.resultado_revision = p_result
      )

      -- Filtro por tipo de servicio
      AND (
          p_service_type IS NULL
          OR m.service_type = p_service_type
      )

      -- Filtro por compra de SOAT
      AND (
          p_soat_purchased IS NULL
          OR m.se_compro_soat = (p_soat_purchased = 'si')
      );

    -- =========================================================
    -- PASO 4: CONSULTAR entry_orders SI EL RANGO INCLUYE HOY
    -- =========================================================

    IF (p_fecha_inicio IS NULL OR p_fecha_inicio <= v_hoy)
       AND (p_fecha_fin IS NULL OR p_fecha_fin >= v_hoy)
    THEN

        SELECT COUNT(*)::integer
        INTO v_total_hoy
        FROM public.entry_orders eo
        WHERE eo.tenant_id = v_tenant_id

          -- Límites de medianoche en hora colombiana,
          -- convertidos a instantes timestamptz
          AND eo.fecha >= v_inicio_hoy
          AND eo.fecha < v_inicio_manana

          -- Mismos criterios de inclusión de la vista
          AND eo.deleted_at IS NULL
          AND eo.estado_orden IS DISTINCT FROM 'anulada'
          AND (
              eo.es_reinspeccion = false
              OR eo.es_reinspeccion IS NULL
          )

          -- Filtros
          AND (
              p_vehicle_type IS NULL
              OR eo.vehiculo_tipo_snapshot = p_vehicle_type
          )
          AND (
              p_result IS NULL
              OR eo.resultado_revision = p_result
          )
          AND (
              p_service_type IS NULL
              OR eo.service_type = p_service_type
          )
          AND (
              p_soat_purchased IS NULL
              OR eo.se_compro_soat = (p_soat_purchased = 'si')
          );

    END IF;

    -- =========================================================
    -- PASO 5: SUMAR AMBAS FUENTES
    -- =========================================================

    RETURN v_total_historico + v_total_hoy;
END;
$$;