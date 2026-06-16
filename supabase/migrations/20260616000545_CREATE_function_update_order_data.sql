CREATE OR REPLACE FUNCTION public.update_office_order_data(
    p_order_id uuid,
    p_pin character varying,
    p_pago numeric,
    p_consecutivo_factura character varying,
    p_tipo_pago text,  -- Se recibe como text para castearlo de forma segura al enum de la BD
    p_se_compro_soat boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    -- 1. Verificación defensiva de la existencia de la orden de entrada
    IF NOT EXISTS (SELECT 1 FROM public.entry_orders WHERE id = p_order_id) THEN
        RAISE EXCEPTION 'La orden de entrada con ID % no existe.', p_order_id;
    END IF;

    -- 2. Ejecución de la actualización de datos de liquidación y oficina
    UPDATE public.entry_orders
    SET
        oficina_pin = NULLIF(TRIM(p_pin), ''),
        oficina_pago = COALESCE(p_pago, 0.00),
        oficina_consecutivo_factura = NULLIF(TRIM(p_consecutivo_factura), ''),
        oficina_tipo_pago = p_tipo_pago::public.office_payment_type_enum, -- Casteo dinámico al ENUM oficial de tu BD
        se_compro_soat = COALESCE(p_se_compro_soat, false),
        updated_at = NOW() -- Forzamos actualización manual aunque el trigger BEFORE UPDATE de tu BD ya lo haga
    WHERE id = p_order_id;

    -- Nota: Al usar la cláusula WHERE id = p_order_id, garantizamos que si el usuario 
    -- reenvía los datos desde la interfaz de la oficina, estos se sobrescriban (actualicen) 
    -- de forma transparente sobre el mismo registro.

END;
$$;