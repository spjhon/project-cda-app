CREATE TABLE IF NOT EXISTS public.order_signatures (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL,
    entry_order_id          UUID NOT NULL,
    -- Referencia a qué rol de firma de la plantilla corresponde
    template_signature_id   UUID NOT NULL,
    
    -- El nombre de quien firmó (Snapshot por si el cliente cambia)
    signer_name             TEXT NOT NULL,
    -- URL del archivo en Supabase Storage
    signature_url           TEXT NOT NULL,

    
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT os_tenant_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id),
    CONSTRAINT os_order_fkey FOREIGN KEY (entry_order_id) REFERENCES public.entry_orders(id) ON DELETE CASCADE
);