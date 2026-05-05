DROP FUNCTION IF EXISTS public.create_full_order_template(jsonb);


CREATE OR REPLACE FUNCTION public.create_full_order_template(p_data jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_template_id uuid;
    v_tenant_id uuid;
    v_signature_record jsonb;
    v_signature_id uuid;
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
        (p_data->>'created_by')::uuid
    )
    --Este returnin es lo que se le puede pedir a la nueva fila creada en order_template despues del insert.
    RETURNING id INTO v_template_id;



    -- 2. Insertamos las condiciones (Hacemos el loop interno con jsonb_to_recordset)
    --"Inserta en esta tabla todo lo que resulte de esta consulta".
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

    --Toma el array que viene en p_data->'conditions' y lo transforma en una tabla virtual.
    --p_data->'conditions': El operador -> extrae el array de condiciones como JSONB.
    --AS t(...): Aquí le defines la estructura a esa tabla virtual. Le dices a Postgres: 
    --"Confía en mí, cada objeto de ese array tiene estas 4 llaves y quiero que las trates como estas columnas".
    FROM jsonb_to_recordset(p_data->'conditions') AS t(
        label text,
        is_special boolean,
        special_condition_label text,
        default_value text
    );


/*
    -- 3. Insertamos las firmas
    -- Nota: Mapeamos los nombres del state (JS) a los nombres de la tabla (SQL)
    INSERT INTO public.order_template_signatures (
        tenant_id,
        order_template_id,
        representative_type,
        signature_label
    )
    SELECT 
        v_tenant_id,
        v_template_id,
        s.a_quien_representa, -- Llave en tu state de React
        s.label_firma         -- Llave en tu state de React
    FROM jsonb_to_recordset(p_data->'signatures') AS s(
        a_quien_representa text,
        label_firma text
    );
*/


-- 3. PROCESO DE FIRMAS Y DECLARACIONES
    -- Iteramos sobre el array de firmas porque cada una genera un ID necesario para sus declaraciones
    FOR v_signature_record IN SELECT * FROM jsonb_array_elements(p_data->'signatures')
    LOOP
        -- A. Insertamos la Firma actual del loop
        INSERT INTO public.order_template_signatures (
            tenant_id,
            order_template_id,
            representative_type,
            signature_label
        )
        VALUES (
            v_tenant_id,
            v_template_id,
            v_signature_record->>'a_quien_representa',
            v_signature_record->>'label_firma'
        )
        RETURNING id INTO v_signature_id;

        -- B. Insertamos todas las declaraciones de ESTA firma específica
        -- Volvemos a la lógica masiva (SELECT) usando el ID de la firma recién creada
        INSERT INTO public.order_template_signature_conditions (
            tenant_id,
            order_template_signature_id,
            declaration_text
        )
        SELECT 
            v_tenant_id,
            v_signature_id,
            d.texto_declaracion
        FROM jsonb_to_recordset(v_signature_record->'declarations') AS d(
            texto_declaracion text
        );
    END LOOP;

    
    -- Devolvemos el ID generado
    RETURN v_template_id;
END;
$$;