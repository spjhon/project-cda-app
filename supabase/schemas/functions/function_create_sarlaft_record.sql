-- ============================================================
-- RPC: Registrar evidencias SARLAFT de una orden
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_sarlaft_evidence(
    p_entry_order_id UUID,

    -- ========================================================
    -- CLIENTE
    -- ========================================================
    p_customer_actividad_economica TEXT,
    p_customer_origen_fondos TEXT,
    p_customer_es_persona_publicamente_expuesta BOOLEAN,

    -- ========================================================
    -- PROPIETARIO
    -- ========================================================
    p_owner_actividad_economica TEXT,
    p_owner_origen_fondos TEXT,
    p_owner_es_persona_publicamente_expuesta BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
    v_customer_id UUID;
    v_owner_id UUID;
BEGIN

    -- ========================================================
    -- OBTENER TENANT Y VALIDAR QUE LA ORDEN EXISTA
    -- ========================================================

    SELECT tenant_id
    INTO v_tenant_id
    FROM public.entry_orders
    WHERE id = p_entry_order_id;

    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION
            'No se encontró la orden de entrada especificada.';
    END IF;


    -- ========================================================
    -- INSERTAR EVIDENCIA DEL CLIENTE
    -- ========================================================

    INSERT INTO public.sarlaft_module (
        tenant_id,
        entry_order_id,
        person_type,

        placa_snapshot,
        nombre_completo_snapshot,
        tipo_documento_snapshot,
        numero_documento_snapshot,

        actividad_economica_snapshot,
        origen_fondos_snapshot,
        es_persona_publicamente_expuesta_snapshot
    )
    SELECT
        v_tenant_id,
        p_entry_order_id,
        'customer',

        eo.vehiculo_placa_snapshot,
        eo.cliente_nombre_snapshot,
        eo.cliente_tipo_documento_snapshot,
        eo.cliente_numero_documento_snapshot,

        p_customer_actividad_economica,
        p_customer_origen_fondos,
        p_customer_es_persona_publicamente_expuesta

    FROM public.entry_orders eo
    WHERE eo.id = p_entry_order_id

    RETURNING id INTO v_customer_id;


    -- ========================================================
    -- INSERTAR EVIDENCIA DEL PROPIETARIO
    -- ========================================================

    INSERT INTO public.sarlaft_module (
        tenant_id,
        entry_order_id,
        person_type,

        placa_snapshot,
        nombre_completo_snapshot,
        tipo_documento_snapshot,
        numero_documento_snapshot,

        actividad_economica_snapshot,
        origen_fondos_snapshot,
        es_persona_publicamente_expuesta_snapshot
    )
    SELECT
        v_tenant_id,
        p_entry_order_id,
        'owner',

        eo.vehiculo_placa_snapshot,
        eo.propietario_nombre_snapshot,
        eo.propietario_tipo_documento_snapshot,
        eo.propietario_numero_documento_snapshot,

        p_owner_actividad_economica,
        p_owner_origen_fondos,
        p_owner_es_persona_publicamente_expuesta

    FROM public.entry_orders eo
    WHERE eo.id = p_entry_order_id

    RETURNING id INTO v_owner_id;


    -- ========================================================
    -- RESPUESTA
    -- ========================================================

    RETURN jsonb_build_object(
        'customer_sarlaft_id', v_customer_id,
        'owner_sarlaft_id', v_owner_id
    );

END;
$$;