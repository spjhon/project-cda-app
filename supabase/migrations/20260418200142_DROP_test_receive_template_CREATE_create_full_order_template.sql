-- 1. Eliminar la función de prueba anterior
DROP FUNCTION IF EXISTS public.test_receive_template(jsonb);

-- 2. Crear la nueva función para insertar la plantilla completa
CREATE OR REPLACE FUNCTION public.create_full_order_template(p_data jsonb)
RETURNS uuid -- Devolvemos el ID de la nueva plantilla
LANGUAGE plpgsql
SECURITY DEFINER -- Recomendado si la llamas desde Supabase para manejar permisos
SET search_path = public
AS $$
DECLARE
    v_template_id uuid;
BEGIN
    -- Insertamos en la tabla principal order_template
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
        (p_data->>'tenant_id')::uuid,
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
    RETURNING id INTO v_template_id;

    -- Devolvemos el ID generado para que el frontend pueda redirigir o confirmar
    RETURN v_template_id;
END;
$$;