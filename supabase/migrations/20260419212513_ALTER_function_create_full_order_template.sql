-- 1. Eliminamos la versión anterior de la función
-- Es necesario porque cambiamos la lógica de retorno o estructura interna
DROP FUNCTION IF EXISTS public.create_full_order_template(jsonb);

-- 2. Creamos la función actualizada
CREATE OR REPLACE FUNCTION public.create_full_order_template(p_data jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
    v_template_id uuid;
    v_tenant_id uuid;
BEGIN
    -- 0. Extraemos el tenant_id una sola vez para usarlo en ambas tablas
    v_tenant_id := (p_data->>'tenant_id')::uuid;

    -- 1. Insertamos en la tabla principal order_template
    INSERT INTO public.order_template (
        tenant_id,
        template_name,
        version,
        is_active,
        document_date,
        document_code,
        logo_url,
        base_contract_text,
        service_type,
        created_by
    )
    VALUES (
        v_tenant_id,
        (p_data->>'template_name'),
        (p_data->>'version')::integer,
        (p_data->>'is_active')::boolean,
        (p_data->>'document_date')::date,
        (p_data->>'document_code'),
        (p_data->>'logo_url'),
        (p_data->>'base_contract_text'),
        (p_data->>'service_type')::public.service_type_enum,
        (p_data->>'created_by')::uuid
    )
    -- Este RETURNING atrapa el ID generado automáticamente por Postgres
    -- y lo guarda en nuestra variable para usarlo en el siguiente paso.
    RETURNING id INTO v_template_id;

    -- 2. Insertamos las condiciones (Hacemos el "loop" implícito con jsonb_to_recordset)
    -- "Inserta en esta tabla todo lo que resulte de esta consulta SELECT".
    INSERT INTO public.order_template_conditions (
        tenant_id,
        order_template_id,
        label,
        is_special,
        special_condition_label,
        default_value
    )
    SELECT 
        v_tenant_id,
        v_template_id,
        t.label,
        t.is_special,
        t.special_condition_label,
        t.default_value::public.condition_response_enum
    -- Toma el array que viene en p_data->'conditions' y lo transforma en una tabla virtual 't'.
    FROM jsonb_to_recordset(p_data->'conditions') AS t(
        label text,
        is_special boolean,
        special_condition_label text,
        default_value text
    );

    -- Devolvemos el ID de la plantilla creada al frontend
    RETURN v_template_id;
END;
$$;