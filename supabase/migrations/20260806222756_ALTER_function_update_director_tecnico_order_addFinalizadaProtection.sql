CREATE OR REPLACE FUNCTION public.update_director_tecnico_order(
    p_order_id uuid,
    p_resultado_revision text,
    p_consecutivo_fur character varying,
    p_consecutivo_rtm character varying,
    p_director_tecnico_tipo_documento_snapshot text,
    p_director_tecnico_numero_documento_snapshot character varying,
    p_director_tecnico_nombre_snapshot text,
    p_director_tecnico_firma_base64_snapshot text
)
RETURNS jsonb  -- ✅ Cambio: retorna JSONB
LANGUAGE plpgsql
SECURITY INVOKER 
SET search_path = public
AS $$
DECLARE
    v_order_id uuid;
    v_message text;

    -- Variables para capturar y validar el resultado post-UPDATE
    v_estado_actualizado public.order_status_enum;
BEGIN
    -- 1. Verificación defensiva de la existencia de la orden
    IF NOT EXISTS (SELECT 1 FROM public.entry_orders WHERE id = p_order_id) THEN
        RAISE EXCEPTION 'La orden de entrada con ID % no existe.', p_order_id;
    END IF;

    -- 2. Ejecución de la actualización del Cierre Técnico (ISO 17020)
    UPDATE public.entry_orders
    SET
        resultado_revision = NULLIF(TRIM(p_resultado_revision), ''),
        consecutivo_fur = NULLIF(TRIM(p_consecutivo_fur), ''),
        consecutivo_rtm = NULLIF(TRIM(p_consecutivo_rtm), ''),
        
        -- Guardado de los snapshots del DT
        director_tecnico_tipo_documento_snapshot = NULLIF(TRIM(p_director_tecnico_tipo_documento_snapshot), ''),
        director_tecnico_numero_documento_snapshot = NULLIF(TRIM(p_director_tecnico_numero_documento_snapshot), ''),
        director_tecnico_nombre_snapshot = NULLIF(TRIM(p_director_tecnico_nombre_snapshot), ''),
        director_tecnico_firma_base64_snapshot = NULLIF(TRIM(p_director_tecnico_firma_base64_snapshot), ''),
        
        -- 🌟 CÁLCULO DE FECHA LÍMITE CON HORA EXACTA (Si es reprobada)
        fecha_limite_reinspeccion = CASE 
            WHEN LOWER(TRIM(p_resultado_revision)) = 'rechazado' THEN NOW() + INTERVAL '15 days'
            ELSE fecha_limite_reinspeccion -- Mantiene lo que tenga si no es reprobada
        END,

        -- Transición de estado
        estado_orden = 'finalizada'::public.order_status_enum
        
    WHERE id = p_order_id
    RETURNING estado_orden INTO v_estado_actualizado; -- 🌟 Atrapamos el valor real escrito en la BD

    -- 🌟 VERIFICACIÓN ESTRICTA DEL CAMPO estado_orden
    IF v_estado_actualizado IS NULL OR v_estado_actualizado != 'finalizada'::public.order_status_enum THEN
        RAISE EXCEPTION 'Error de consistencia: La orden % no pudo ser marcada como finalizada (Estado resultante: %).', 
            p_order_id, COALESCE(v_estado_actualizado::text, 'NULL');
    END IF;

    -- 🌟 2.5 NUEVO BLOQUE: ENLACE DE REINSPECCIÓN CON LA ORDEN VIEJA
    -- Es totalmente independiente. Busca la orden vieja basándose en el id_reprobado de la actual.
    UPDATE public.entry_orders
    SET id_orden_reinspeccion = p_order_id
    WHERE id = (
        SELECT id_reprobado 
        FROM public.entry_orders 
        WHERE id = p_order_id 
          AND es_reinspeccion = TRUE 
          AND id_reprobado IS NOT NULL
    );

    -- 3. Asignar mensaje de éxito
    v_message := 'Cierre técnico registrado con éxito';
    v_order_id := p_order_id;

    -- 4. Retornar JSON con id y message
    RETURN jsonb_build_object(
        'id', v_order_id,
        'message', v_message
    );

END;
$$;