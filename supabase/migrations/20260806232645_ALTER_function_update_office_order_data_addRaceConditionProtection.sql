CREATE OR REPLACE FUNCTION public.update_office_order_data(
    p_order_id uuid,
    p_pin character varying,
    p_pago numeric,
    p_consecutivo_factura character varying,
    p_tipo_pago text,
    p_se_compro_soat boolean,
    p_num_aprobacion character varying DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_estado_actual public.order_status_enum;
BEGIN
    -- 1. Obtener estado actual de la orden y verificar su existencia en un solo paso
    SELECT estado_orden 
    INTO v_estado_actual
    FROM public.entry_orders 
    WHERE id = p_order_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'La orden de entrada con ID % no existe.', p_order_id;
    END IF;

    -- 🌟 1.5 VALIDACIÓN DE ESTADO BLOQUEANTE:
    -- Evita sobrescribir órdenes que ya concluyeron o fueron canceladas desde otra pantalla
    IF v_estado_actual IN ('finalizada'::public.order_status_enum, 'anulada'::public.order_status_enum) THEN
        RAISE EXCEPTION 'Operación denegada: La orden % no se puede modificar porque su estado actual es "%".', 
            p_order_id, v_estado_actual;
    END IF;

    -- 2. VALIDACIÓN DEFENSIVA PARA TARJETAS
    IF (p_tipo_pago = 'tarjeta_debito' OR p_tipo_pago = 'tarjeta_credito') 
        AND (p_num_aprobacion IS NULL OR TRIM(p_num_aprobacion) = '') THEN
        RAISE EXCEPTION 'Operación cancelada: Las transacciones con tarjeta requieren un número de aprobación válido.';
    END IF;

    -- 3. Ejecución de la actualización
    UPDATE public.entry_orders
    SET
        oficina_pin = NULLIF(TRIM(p_pin), ''),
        oficina_pago = COALESCE(p_pago, 0.00),
        oficina_consecutivo_factura = NULLIF(TRIM(p_consecutivo_factura), ''),
        oficina_tipo_pago = p_tipo_pago::public.office_payment_type_enum,
        
        -- Guardamos el número de aprobación de forma limpia
        oficina_num_aprobacion = CASE 
            WHEN p_tipo_pago IN ('tarjeta_debito', 'tarjeta_credito') THEN NULLIF(TRIM(p_num_aprobacion), '')
            ELSE NULL 
        END,
        se_compro_soat = COALESCE(p_se_compro_soat, false),
        estado_orden = 'en_prueba'::public.order_status_enum, -- Pasa a pista
        updated_at = NOW()
    WHERE id = p_order_id;

    -- 4. Retornamos el mensaje de éxito
    RETURN 'Datos guardados con éxito';

END;
$$;