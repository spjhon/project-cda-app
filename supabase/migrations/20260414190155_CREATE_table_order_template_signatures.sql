-- ==========================================
-- 1. TABLA: order_template_signatures (Firmas Requeridas)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.order_template_signatures (
    -- Identificadores
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL,
    order_template_id       UUID NOT NULL,
    
    -- Configuración de la Firma
    representative_type     TEXT NOT NULL, -- Ahora es texto libre (Ej: 'Gerente', 'Secretaria', 'Inspector')
    signature_label         TEXT NOT NULL, -- Ej: 'Firma de quien recibe el vehículo'
    
    -- UI y Ordenamiento
    visual_order            INTEGER NOT NULL DEFAULT 0,

    -- Auditoría
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at              TIMESTAMPTZ
);

-- ==========================================
-- 2. FOREIGN KEYS (Relaciones)
-- ==========================================

ALTER TABLE public.order_template_signatures
    ADD CONSTRAINT order_template_signatures_template_id_fkey 
    FOREIGN KEY (order_template_id) REFERENCES public.order_template(id) ON DELETE CASCADE;

ALTER TABLE public.order_template_signatures
    ADD CONSTRAINT order_template_signatures_tenant_id_fkey 
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- ==========================================
-- 3. CONSTRAINTS (Validaciones)
-- ==========================================

-- Unicidad lógica: Evitar duplicados en el mismo orden visual por plantilla
ALTER TABLE public.order_template_signatures
    ADD CONSTRAINT order_template_signatures_unique_pos 
    UNIQUE (order_template_id, visual_order, deleted_at);

-- ==========================================
-- 4. ÍNDICES (Rendimiento)
-- ==========================================

CREATE INDEX IF NOT EXISTS order_template_signatures_tenant_idx 
    ON public.order_template_signatures USING btree (tenant_id);

CREATE INDEX IF NOT EXISTS order_template_signatures_template_idx 
    ON public.order_template_signatures (order_template_id, visual_order)
    WHERE (deleted_at IS NULL);

-- ==========================================
-- 5. COMENTARIOS DE DOCUMENTACIÓN
-- ==========================================

COMMENT ON TABLE public.order_template_signatures IS 'Define los roles que deben firmar la orden. Texto libre para máxima adaptabilidad.';
COMMENT ON COLUMN public.order_template_signatures.representative_type IS 'Nombre del rol legal (libre): Gerente, DT, Recepcionista, etc.';

-- ==========================================
-- 6. GRANTS
-- ==========================================

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.order_template_signatures TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.order_template_signatures TO service_role;