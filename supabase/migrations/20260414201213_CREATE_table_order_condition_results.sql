CREATE TABLE IF NOT EXISTS public.order_condition_results (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL,
    entry_order_id          UUID NOT NULL,
    -- Referencia a la pregunta original
    template_condition_id   UUID NOT NULL,
    
    -- El resultado marcado por el inspector
    value                   condition_response_enum NOT NULL,
    -- Si era una condición especial (ej: checkbox de disco de freno), aquí se guarda si se marcó
    special_value           BOOLEAN DEFAULT false,
    
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ocr_tenant_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id),
    CONSTRAINT ocr_order_fkey FOREIGN KEY (entry_order_id) REFERENCES public.entry_orders(id) ON DELETE CASCADE
);