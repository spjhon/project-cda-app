-- ============================================================
-- 1. CONFIGURACIÓN DE MÓDULOS POR TENANT
-- ============================================================

CREATE TABLE public.tenant_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tenant al que pertenece esta configuración.
    tenant_id UUID NOT NULL,

    -- Módulo global que se está habilitando/configurando.
    module_id UUID NOT NULL,

    -- Indica si el tenant tiene habilitado el módulo.
    is_enabled BOOLEAN NOT NULL DEFAULT false,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT tenant_modules_tenant_id_fkey
        FOREIGN KEY (tenant_id)
        REFERENCES public.tenants (id)
        ON DELETE CASCADE,

    CONSTRAINT tenant_modules_module_id_fkey
        FOREIGN KEY (module_id)
        REFERENCES public.modules (id)
        ON DELETE CASCADE,

    -- Un tenant no puede tener dos veces el mismo módulo.
    CONSTRAINT tenant_modules_tenant_module_key
        UNIQUE (tenant_id, module_id)
);


-- ============================================================
-- 2. ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS tenant_modules_module_idx
ON public.tenant_modules
USING btree (module_id);


-- ============================================================
-- 3. GRANTS
-- ============================================================

GRANT SELECT
ON TABLE public.tenant_modules
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.tenant_modules
TO service_role;


-- ============================================================
-- 4. COMENTARIOS DE LA TABLA
-- ============================================================

COMMENT ON TABLE public.tenant_modules IS
'Configuración de los módulos disponibles para cada tenant. Relaciona los tenants con el catálogo global de módulos.';

COMMENT ON COLUMN public.tenant_modules.id IS
'Identificador único de la configuración del módulo para el tenant.';

COMMENT ON COLUMN public.tenant_modules.tenant_id IS
'Identificador del tenant que posee esta configuración de módulo.';

COMMENT ON COLUMN public.tenant_modules.module_id IS
'Identificador del módulo global configurado para este tenant.';

COMMENT ON COLUMN public.tenant_modules.is_enabled IS
'Indica si el módulo está habilitado para este tenant. El módulo también debe estar activo globalmente en la tabla modules para estar disponible.';

COMMENT ON COLUMN public.tenant_modules.created_at IS
'Fecha y hora de creación de la configuración.';

COMMENT ON COLUMN public.tenant_modules.updated_at IS
'Fecha y hora de la última actualización de la configuración.';


-- ============================================================
-- 5. RLS
-- ============================================================

ALTER TABLE public.tenant_modules ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SELECT: Solo módulos de los tenants del usuario
-- ============================================================

CREATE POLICY "select_tenant_modules_by_tenant"
ON public.tenant_modules
FOR SELECT
TO authenticated
USING (
    tenant_id IN (SELECT public.get_my_tenants())
);