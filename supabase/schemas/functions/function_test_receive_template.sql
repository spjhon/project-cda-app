CREATE OR REPLACE FUNCTION test_receive_template(p_data jsonb)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    v_template_name text;
BEGIN
    -- Extraemos el nombre directamente del JSONB para probar que funciona
    v_template_name := p_data->>'template_name';

    RETURN 'Conexión exitosa. Postgres recibió la plantilla: ' || v_template_name;
END;
$$;