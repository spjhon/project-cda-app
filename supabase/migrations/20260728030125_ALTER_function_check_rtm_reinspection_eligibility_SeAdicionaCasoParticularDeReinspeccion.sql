/****************************************************************************************************
 * NOTA DE MANTENIMIENTO / REGLA DE NEGOCIO:
 * 
 * Se selecciona 'ORDER BY fecha DESC LIMIT 1' sin filtrar previamente 'CURRENT_DATE <= fecha_limite'
 * para manejar correctamente el ciclo de reinspección cuando un vehículo reprueba por segunda vez.
 * 
 * ESCENARIO ATENDIDO:
 * 1. Vehículo reprueba Orden A (tiene 15 días).
 * 2. Hace reinspección A1 y reprueba de nuevo.
 * 3. Antes de vencer los 15 días de Orden A, el usuario paga una nueva prueba por primera vez (Orden B).
 * 4. La Orden B vuelve a salir reprobada.
 * 5. El vehicul va nuevamente para reinspeccion
 * 
 * LÓGICA:
 * Evaluamos únicamente la ÚLTIMA orden original (Orden B). Al ser un nuevo intento por primera vez,
 * genera un nuevo derecho a reinspección totalmente independiente de la Orden A anterior.
 ****************************************************************************************************/



CREATE OR REPLACE FUNCTION public.check_rtm_reinspection_eligibility(
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
AS $$
DECLARE
    v_orden_id UUID;
    v_fecha_limite DATE;
    v_ya_reinspeccionada BOOLEAN;
BEGIN

    -- 1. Obtener directamente la ÚLTIMA orden original RTM rechazada
    SELECT id, fecha_limite_reinspeccion
    INTO v_orden_id, v_fecha_limite
    FROM public.entry_orders
    WHERE vehiculo_placa_snapshot = p_placa
      AND tenant_id = p_tenant_id
      AND es_reinspeccion = false
      AND service_type = 'RTM'
      AND estado_orden = 'finalizada'
      AND resultado_revision = 'rechazado'
      AND deleted_at IS NULL
    ORDER BY fecha DESC
    LIMIT 1;

    -- Si nunca se ha registrado una orden original rechazada
    IF v_orden_id IS NULL THEN
        merece_reinspeccion := false;
        motivo := 'No se encontró ninguna revisión técnico-mecánica rechazada dentro del plazo de los 15 dias para esta placa.';
        id_reprobado := NULL;
        RETURN NEXT;
        RETURN;
    END IF;

    -- 2. Validar si la última orden original rechazada ya superó el plazo legal
    IF CURRENT_DATE > v_fecha_limite THEN
        merece_reinspeccion := false;
        motivo := 'El plazo legal para reinspección de la última revisión rechazada ya expiró (Límite: ' || to_char(v_fecha_limite, 'DD/MM/YYYY') || ').';
        id_reprobado := NULL;
        RETURN NEXT;
        RETURN;
    END IF;

    -- 3. Comprobar si ESTA última orden original en particular ya consumió su reinspección
    SELECT EXISTS (
        SELECT 1 
        FROM public.entry_orders 
        WHERE public.entry_orders.id_reprobado = v_orden_id
          AND es_reinspeccion = true
          AND deleted_at IS NULL
    ) INTO v_ya_reinspeccionada;

    IF v_ya_reinspeccionada THEN
        merece_reinspeccion := false;
        motivo := 'El derecho a reinspección para la última orden rechazada ya fue utilizado.';
        id_reprobado := NULL;
        RETURN NEXT;
        RETURN;
    END IF;

    -- 4. Todo correcto: Retornamos los datos apuntando a la última orden reprobada
    merece_reinspeccion := true;
    motivo := 'Vehículo apto. Aplica para reinspección (Plazo límite: ' || to_char(v_fecha_limite, 'DD/MM/YYYY') || ')';
    id_reprobado := v_orden_id;
    
    RETURN NEXT;
END;
$$;