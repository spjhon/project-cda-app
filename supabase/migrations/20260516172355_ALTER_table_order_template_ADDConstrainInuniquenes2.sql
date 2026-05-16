-- Eliminamos el constraint viejo para que no haga estorbo
ALTER TABLE public.order_template 
    DROP CONSTRAINT IF EXISTS order_template_name_version_code_tenant_key;

-- Evita que se repita la combinación de Código + Versión por cada CDA (tenant_id)
ALTER TABLE public.order_template
    ADD CONSTRAINT order_template_code_version_tenant_key 
    UNIQUE (tenant_id, document_code, version);

    --  Creamos TU restricción exacta: Nombre + Versión + Código Únicos por Tenant
ALTER TABLE public.order_template
    ADD CONSTRAINT order_template_name_version_code_tenant_key 
    UNIQUE (tenant_id, template_name, version, document_code);