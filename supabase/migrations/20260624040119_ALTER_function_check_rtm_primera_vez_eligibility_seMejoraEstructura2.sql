CREATE OR REPLACE FUNCTION public.check_rtm_primera_vez_eligibility(
    p_placa CHARACTER VARYING,
    p_tenant_id UUID
)
RETURNS TABLE (
    puede_primera_vez BOOLEAN,
    motivo TEXT
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_orden_id UUID;
    v_fecha_limite TIMESTAMPTZ;
    v_estado_reinspeccion public.order_status_enum;
    v_conteo_originales INT;
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
      AND LOWER(TRIM(resultado_revision)) = 'rechazado'
      AND NOW() <= fecha_limite_reinspeccion
      AND deleted_at IS NULL;

    IF v_conteo_originales > 1 THEN
        puede_primera_vez := false; -- 🛑 Bloqueamos por consistencia de datos
        motivo := 'Error crítico: Existe más de una orden original reprobada vigente en el sistema para esta placa. Contacte al administrador para revisar el historial.';
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
      AND LOWER(TRIM(resultado_revision)) = 'rechazado'
      AND NOW() <= fecha_limite_reinspeccion
      AND deleted_at IS NULL
    ORDER BY fecha DESC
    LIMIT 1;

    -- SI NO TIENE RECHAZOS VIGENTES: Puede pasar tranquilamente como Primera Vez
    IF v_orden_id IS NULL THEN
        puede_primera_vez := true;
        motivo := 'Vehículo apto para ingresar como Primera Vez.';
        RETURN NEXT;
        RETURN;
    END IF;

    -- ==========================================
    -- 3. ESTADO DE LA REINSPECCIÓN
    -- ==========================================
    SELECT estado_orden
    INTO v_estado_reinspeccion
    FROM public.entry_orders 
    WHERE public.entry_orders.id_reprobado = v_orden_id
      AND es_reinspeccion = true
      AND estado_orden IN ('abierta', 'en_prueba', 'finalizada')
      AND deleted_at IS NULL
    ORDER BY fecha DESC
    LIMIT 1;

    -- ESCENARIO A: No ha usado su reinspección
    IF v_estado_reinspeccion IS NULL THEN
        puede_primera_vez := false; -- 🛑 Bloqueamos
        motivo := 'No se permite Primera Vez. El vehículo se encuentra en periodo de gracia para Reinspección gratuita/descuento (Vence: ' || to_char(v_fecha_limite, 'DD/MM/YYYY HH:MI AM') || ').';
        RETURN NEXT;
        RETURN;
    END IF;

    -- ESCENARIO B: La reinspección se está ejecutando ahora mismo
    IF v_estado_reinspeccion IN ('abierta', 'en_prueba') THEN
        puede_primera_vez := false; -- 🛑 Bloqueamos
        motivo := 'El vehículo tiene una orden de reinspección en curso en este momento. No se puede generar una nueva orden de Primera Vez simultáneamente.';
        RETURN NEXT;
        RETURN;
    END IF;

    -- ESCENARIO C: La reinspección está FINALIZADA
    puede_primera_vez := true; -- ✅ Permitimos
    motivo := 'El vehículo ya agotó su derecho a reinspección para el último rechazo. Puede ingresar pagando una nueva Primera Vez.';
    
    RETURN NEXT;
END;
$$;