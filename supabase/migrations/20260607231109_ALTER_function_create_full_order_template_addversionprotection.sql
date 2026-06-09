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
    
    -- Variables para la nueva validación
    v_document_code text;
    v_new_version integer;
    v_max_version integer;
BEGIN
    -- 0. Extraemos los datos de control iniciales
    v_tenant_id := (p_data->>'tenant_id')::uuid;
    v_document_code := (p_data->>'document_code');
    v_new_version := (p_data->>'version')::integer;

    -- ==============================================================================
    -- VALIDADOR DE CONTROL DE VERSIONES (ISO 17020)
    -- ==============================================================================
    -- Buscamos la versión más alta existente para este código de documento y tenant
    SELECT COALESCE(MAX(version), 0)
    INTO v_max_version
    FROM public.order_template
    WHERE tenant_id = v_tenant_id
      AND document_code = v_document_code;

    -- Si ya existen versiones y la nueva versión es menor o igual a la máxima, bloqueamos
    IF v_max_version > 0 AND v_new_version <= v_max_version THEN
        RAISE EXCEPTION 'Control de documentos rechazado: El código % ya cuenta con la versión %. La nueva versión debe ser estrictamente mayor (mínimo %).', 
            v_document_code, v_max_version, (v_max_version + 1)
            USING ERRCODE = '45000'; -- Código personalizado para excepciones de negocio
    END IF;
    -- ==============================================================================


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
        v_new_version,
        (p_data->>'is_active')::boolean,
        (p_data->>'document_date')::date,
        v_document_code,
        (p_data->>'logo_url'),
        (p_data->>'base_contract_text'),
        (p_data->>'created_by')::uuid
    )
    RETURNING id INTO v_template_id;

    -- 2. Insertamos las condiciones (Hacemos el loop interno con jsonb_to_recordset)
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
    FROM jsonb_to_recordset(p_data->'conditions') AS t(
        label text,
        is_special boolean,
        special_condition_label text,
        default_value text
    );

    -- 3. PROCESO DE FIRMAS Y DECLARACIONES
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