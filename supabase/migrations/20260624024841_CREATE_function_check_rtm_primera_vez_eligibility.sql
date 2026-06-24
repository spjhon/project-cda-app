CREATE OR REPLACE FUNCTION public.check_rtm_primera_vez_eligibility(
    p_placa CHARACTER VARYING,
    p_tenant_id UUID
)
RETURNS TABLE (
    merece_reinspeccion BOOLEAN,
    motivo TEXT,
    id_reprobado UUID
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_orden_id UUID;
    v_fecha_limite TIMESTAMPTZ;
    v_conteo_originales INT;
    v_ya_reinspeccionada BOOLEAN;
BEGIN
    -- ==========================================
    -- 1. CONTROL DE INTEGRIDAD / MULTIPLICIDAD
    -- ==========================================
    SELECT COUNT(*)
    INTO v_conteo_originales
    FROM public.entry_orders
    WHERE vehiculo_placa_snapshot = p_placa
      AND tenant_id = p_tenant_id
      AND es_reinspeccion = false
      AND service_type = 'RTM'
      AND estado_orden = 'finalizada'
      AND LOWER(TRIM(resultado_revision)) = 'reprobado'
      AND NOW() <= fecha_limite_reinspeccion
      AND deleted_at IS NULL;

    IF v_conteo_originales > 1 THEN
        merece_reinspeccion := false;
        motivo := 'Error crítico: Existe más de una orden original reprobada vigente en el sistema para esta placa.';
        id_reprobado := NULL;
        RETURN NEXT;
        RETURN;
    END IF;

    -- ==========================================
    -- 2. SELECCIÓN DE LA ORDEN REPROBADA VIGENTE
    -- ==========================================
    SELECT id, fecha_limite_reinspeccion
    INTO v_orden_id, v_fecha_limite
    FROM public.entry_orders
    WHERE vehiculo_placa_snapshot = p_placa
      AND tenant_id = p_tenant_id
      AND es_reinspeccion = false
      AND service_type = 'RTM'
      AND estado_orden = 'finalizada'
      AND LOWER(TRIM(resultado_revision)) = 'reprobado'
      AND NOW() <= fecha_limite_reinspeccion
      AND deleted_at IS NULL
    ORDER BY fecha DESC
    LIMIT 1;

    -- Si no hay ninguna orden reprobada vigente, el carro está libre (No amerita reinspección)
    IF v_orden_id IS NULL THEN
        merece_reinspeccion := false;
        motivo := 'No se encontraron RTM reprobadas vigentes. El vehículo puede ingresar como revisión normal (Primera Vez).';
        id_reprobado := NULL;
        RETURN NEXT;
        RETURN;
    END IF;

    -- ==========================================
    -- 3. VERIFICAR SI YA EXISTE UNA REINSPECCIÓN LIGADA
    -- ==========================================
    SELECT EXISTS (
        SELECT 1 
        FROM public.entry_orders 
        WHERE public.entry_orders.id_reprobado = v_orden_id
          AND es_reinspeccion = true
          AND estado_orden IN ('abierta', 'en_prueba', 'finalizada')
          AND deleted_at IS NULL
    ) INTO v_ya_reinspeccionada;

    -- Si está dentro de los 15 días y NO se ha reinspeccionado aún:
    IF NOT v_ya_reinspeccionada THEN
        merece_reinspeccion := true; -- 🛑 TRUE: El front sabe que debe bloquear "Primera Vez" porque "merece" la otra.
        motivo := 'No se puede crear como Primera Vez. El vehículo tiene una RTM REPROBADA vigente y está a la espera de su Reinspección (Límite: ' || to_char(v_fecha_limite, 'DD/MM/YYYY HH:MI AM') || ').';
        id_reprobado := v_orden_id;
        RETURN NEXT;
        RETURN;
    END IF;

    -- Si ya se reinspeccionó, ya no merece más beneficios, puede continuar como Primera Vez normal
    merece_reinspeccion := false;
    motivo := 'El derecho de reinspección para la última orden rechazada ya fue ejecutado completamente o está en proceso. Debe ingresar como una nueva Primera Vez.';
    id_reprobado := NULL;
    
    RETURN NEXT;
END;
$$;