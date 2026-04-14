-- ==========================================
-- 1. TABLA: order_template_signature_conditions
-- ==========================================

CREATE TABLE IF NOT EXISTS public.order_template_signature_conditions (
    -- Identificadores
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   UUID NOT NULL,
    order_template_signature_id UUID NOT NULL,
    
    -- Configuración de la Declaración
    declaration_text            TEXT NOT NULL,
    
    
    -- Auditoría
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at                  TIMESTAMPTZ
);

-- ==========================================
-- 2. FOREIGN KEYS (Relaciones)
-- ==========================================

ALTER TABLE public.order_template_signature_conditions
    ADD CONSTRAINT signature_conditions_signature_id_fkey 
    FOREIGN KEY (order_template_signature_id) 
    REFERENCES public.order_template_signatures(id) ON DELETE CASCADE;

ALTER TABLE public.order_template_signature_conditions
    ADD CONSTRAINT signature_conditions_tenant_id_fkey 
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- ==========================================
-- 3. ÍNDICES (Rendimiento)
-- ==========================================

CREATE INDEX IF NOT EXISTS signature_conditions_tenant_idx 
    ON public.order_template_signature_conditions USING btree (tenant_id);

CREATE INDEX IF NOT EXISTS signature_conditions_parent_idx 
    ON public.order_template_signature_conditions (order_template_signature_id)
    WHERE (deleted_at IS NULL);

-- ==========================================
-- 4. COMENTARIOS DE DOCUMENTACIÓN
-- ==========================================

COMMENT ON TABLE public.order_template_signature_conditions IS 'Textos de aceptación legal vinculados a una firma. Todos son obligatorios por defecto.';

-- ==========================================
-- 5. GRANTS
-- ==========================================

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.order_template_signature_conditions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.order_template_signature_conditions TO service_role;