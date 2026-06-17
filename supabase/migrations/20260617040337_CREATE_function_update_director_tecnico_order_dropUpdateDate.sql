CREATE OR REPLACE FUNCTION public.update_director_tecnico_order(
    p_order_id uuid,
    p_resultado_revision text,
    p_consecutivo_fur character varying,
    p_consecutivo_rtm character varying
)
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER -- Mantiene el estándar de seguridad de tu función de oficina
SET search_path = public
AS $$
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
        -- Si viene vacío o nulo desde el server action (ej: por rechazo), se guarda como NULL
        consecutivo_rtm = NULLIF(TRIM(p_consecutivo_rtm), ''),
        
        -- Transición de estado: La orden culmina su ciclo operativo en el CDA
        estado_orden = 'finalizada'::public.order_status_enum 
        
        
    WHERE id = p_order_id;

    -- 3. Retorno de confirmación para el cliente/Server Action
    RETURN 'Cierre técnico registrado con éxito';

END;
$$;