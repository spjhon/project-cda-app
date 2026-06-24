ALTER TABLE public.entry_orders 
ALTER COLUMN fecha_limite_reinspeccion TYPE TIMESTAMPTZ;


-- Elimina la función antigua de 4 parámetros
DROP FUNCTION IF EXISTS public.update_director_tecnico_order(
    uuid, 
    text, 
    character varying, 
    character varying
);


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
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER 
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
        consecutivo_rtm = NULLIF(TRIM(p_consecutivo_rtm), ''),
        
        -- Guardado de los snapshots del DT
        director_tecnico_tipo_documento_snapshot = NULLIF(TRIM(p_director_tecnico_tipo_documento_snapshot), ''),
        director_tecnico_numero_documento_snapshot = NULLIF(TRIM(p_director_tecnico_numero_documento_snapshot), ''),
        director_tecnico_nombre_snapshot = NULLIF(TRIM(p_director_tecnico_nombre_snapshot), ''),
        director_tecnico_firma_base64_snapshot = NULLIF(TRIM(p_director_tecnico_firma_base64_snapshot), ''),
        
        -- 🌟 CÁLCULO DE FECHA LÍMITE CON HORA EXACTA (Si es reprobada)
        fecha_limite_reinspeccion = CASE 
            WHEN LOWER(TRIM(p_resultado_revision)) = 'reprobado' THEN NOW() + INTERVAL '15 days'
            ELSE fecha_limite_reinspeccion -- Mantiene lo que tenga si no es reprobada
        END,

        -- Transición de estado
        estado_orden = 'finalizada'::public.order_status_enum
        
    WHERE id = p_order_id;

    -- 3. Retorno de confirmación
    RETURN 'Cierre técnico registrado con éxito';

END;
$$;