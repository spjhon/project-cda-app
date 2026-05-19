CREATE TABLE IF NOT EXISTS public.order_signatures (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL,
    entry_order_id          UUID NOT NULL,
    -- Referencia a qué rol de firma de la plantilla corresponde
    template_signature_id   UUID NOT NULL,
    
   
    -- URL del archivo en Supabase Storage
    signature_url           TEXT NOT NULL,

    
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT os_tenant_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id),
    CONSTRAINT os_order_fkey FOREIGN KEY (entry_order_id) REFERENCES public.entry_orders(id) ON DELETE CASCADE,
    CONSTRAINT os_template_sig_fkey FOREIGN KEY (template_signature_id) REFERENCES public.order_template_signatures(id)
);


-- ==========================================
-- ÍNDICES PARA order_signatures
-- ==========================================

-- Para recuperar rápido las firmas de una orden (útil al generar el PDF)
CREATE INDEX IF NOT EXISTS os_entry_order_id_idx 
    ON public.order_signatures (entry_order_id);

-- Para optimizar el filtrado de seguridad por CDA
CREATE INDEX IF NOT EXISTS os_tenant_id_idx 
    ON public.order_signatures (tenant_id);

-- Optimiza la búsqueda por tipo de firma (Inspector, Cliente, etc.)
CREATE INDEX IF NOT EXISTS os_template_sig_id_idx 
    ON public.order_signatures (template_signature_id);


-- ==========================================
-- 5. GRANTS (Permisos de Acceso)
-- ==========================================

-- Permisos para el usuario autenticado (App Next.js)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.order_signatures TO authenticated;

-- Permisos para el rol de servicio (Edge Functions / Admin)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.order_signatures TO service_role;

-- ==========================================
-- 1. HABILITAR RLS: order_signatures
-- ==========================================
ALTER TABLE public.order_signatures ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 2. RLS: SELECT
-- ==========================================
-- POLÍTICA: Permite ver las firmas asociadas a los tenants autorizados
CREATE POLICY "Users can see order signatures from their allowed tenants"
ON public.order_signatures
FOR SELECT
TO authenticated
USING (
    tenant_id IN (
        SELECT tp.tenant_id 
        FROM public.tenant_permissions tp
        JOIN public.service_users su ON su.id = tp.service_user_id
        WHERE su.auth_user_id = (SELECT auth.uid())
    )
);

-- ==========================================
-- 3. RLS: INSERT (CREATE)
-- ==========================================
-- POLÍTICA: Permite registrar firmas solo para sus propios tenants
CREATE POLICY "Users can create order signatures for their allowed tenants"
ON public.order_signatures
FOR INSERT
TO authenticated
WITH CHECK (
    tenant_id IN (
        SELECT tp.tenant_id 
        FROM public.tenant_permissions tp
        JOIN public.service_users su ON su.id = tp.service_user_id
        WHERE su.auth_user_id = (SELECT auth.uid())
    )
);


-- ==========================================
-- 4. RLS: UPDATE (order_signatures)
-- ==========================================

-- POLÍTICA: Permite actualizar registros de firmas, validando la pertenencia al tenant
CREATE POLICY "Users can update order signatures from their allowed tenants"
ON public.order_signatures
FOR UPDATE
TO authenticated
USING (
    tenant_id IN (
        SELECT tp.tenant_id 
        FROM public.tenant_permissions tp
        JOIN public.service_users su ON su.id = tp.service_user_id
        WHERE su.auth_user_id = (SELECT auth.uid())
    )
)
WITH CHECK (
    tenant_id IN (
        SELECT tp.tenant_id 
        FROM public.tenant_permissions tp
        JOIN public.service_users su ON su.id = tp.service_user_id
        WHERE su.auth_user_id = (SELECT auth.uid())
    )
);