

CREATE OR REPLACE FUNCTION public.update_office_order_data(
    p_order_id uuid,
    p_pin character varying,
    p_pago numeric,
    p_consecutivo_factura character varying,
    p_tipo_pago text,
    p_se_compro_soat boolean
)
RETURNS text -- 🌟 Cambiado de void a text para retornar el mensaje de éxito
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    -- 1. Verificación defensiva de la existencia de la orden
    IF NOT EXISTS (SELECT 1 FROM public.entry_orders WHERE id = p_order_id) THEN
        RAISE EXCEPTION 'La orden de entrada con ID % no existe.', p_order_id;
    END IF;

    -- 2. Ejecución de la actualización
    UPDATE public.entry_orders
    SET
        oficina_pin = NULLIF(TRIM(p_pin), ''),
        oficina_pago = COALESCE(p_pago, 0.00),
        oficina_consecutivo_factura = NULLIF(TRIM(p_consecutivo_factura), ''),
        oficina_tipo_pago = p_tipo_pago::public.office_payment_type_enum,
        se_compro_soat = COALESCE(p_se_compro_soat, false),
        estado_orden = 'en_prueba'::public.order_status_enum, -- 🌟 Cambia el estado para habilitarla en pista
        updated_at = NOW()
    WHERE id = p_order_id;

    -- 3. Retornamos el string exacto que necesitas
    RETURN 'Datos guardados con exito';

END;
$$;