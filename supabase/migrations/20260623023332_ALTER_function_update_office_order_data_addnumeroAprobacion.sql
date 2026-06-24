





CREATE OR REPLACE FUNCTION public.update_office_order_data(
    p_order_id uuid,
    p_pin character varying,
    p_pago numeric,
    p_consecutivo_factura character varying,
    p_tipo_pago text,
    p_se_compro_soat boolean,
    p_num_aprobacion character varying DEFAULT NULL -- 🌟 NUEVO PARÁMETRO
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

    -- 🌟 2. VALIDACIÓN DEFENSIVA EN BASE DE DATOS PARA TARJETAS
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
        -- 🌟 Guardamos el número de aprobación (si no es tarjeta, se guardará NULL de forma limpia)
        oficina_num_aprobacion = CASE 
            WHEN p_tipo_pago IN ('tarjeta_debito', 'tarjeta_credito') THEN NULLIF(TRIM(p_num_aprobacion), '')
            ELSE NULL 
        END,
        se_compro_soat = COALESCE(p_se_compro_soat, false),
        estado_orden = 'en_prueba'::public.order_status_enum, -- Pasa a pista
        updated_at = NOW()
    WHERE id = p_order_id;

    -- 4. Retornamos el mensaje de éxito
    RETURN 'Datos guardados con exito';

END;
$$;