-- 1. Eliminamos el constraint viejo para que no haga estorbo
ALTER TABLE public.order_template 
    DROP CONSTRAINT IF EXISTS order_template_name_version_tenant_key;

-- 2. Creamos el nuevo constraint incluyendo el document_code
ALTER TABLE public.order_template
    ADD CONSTRAINT order_template_name_version_code_tenant_key 
    UNIQUE (tenant_id, template_name, version, document_code);