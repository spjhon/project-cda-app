-- ============================================================
-- 1. CATÁLOGO GLOBAL DE MÓDULOS
-- ============================================================

CREATE TABLE public.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identificador técnico estable.
    -- Ej: "sarlaft", "runt", "soat", "analytics"
    code VARCHAR(100) NOT NULL UNIQUE,

    -- Nombre que se muestra en administración.
    name VARCHAR(150) NOT NULL,

    -- Descripción del módulo.
    description TEXT NULL,

    -- Permite desactivar un módulo globalmente
    -- sin eliminarlo ni afectar los tenants que lo tienen registrado.
    is_active BOOLEAN NOT NULL DEFAULT true,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT modules_code_check
        CHECK (length(trim(code)) > 0),

    CONSTRAINT modules_name_check
        CHECK (length(trim(name)) > 0)
);


-- ==========================================
-- GRANTS
-- ==========================================


GRANT SELECT ON TABLE public.modules TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.modules
TO service_role;

-- ============================================================
-- 3. COMENTARIOS DE LA TABLA
-- ============================================================

COMMENT ON TABLE public.modules IS
'Catálogo global de módulos disponibles en la plataforma. No pertenece a un tenant específico.';

COMMENT ON COLUMN public.modules.id IS
'Identificador único del módulo.';

COMMENT ON COLUMN public.modules.code IS
'Identificador técnico estable del módulo utilizado por la aplicación para determinar su funcionalidad. Ejemplos: sarlaft, runt, soat, analytics.';

COMMENT ON COLUMN public.modules.name IS
'Nombre legible del módulo utilizado en interfaces de administración.';

COMMENT ON COLUMN public.modules.description IS
'Descripción funcional del módulo.';

COMMENT ON COLUMN public.modules.is_active IS
'Indica si el módulo está habilitado globalmente en la plataforma. Un módulo puede estar deshabilitado globalmente aunque existan registros de configuración para tenants.';

COMMENT ON COLUMN public.modules.created_at IS
'Fecha y hora de creación del registro.';

COMMENT ON COLUMN public.modules.updated_at IS
'Fecha y hora de la última actualización del registro.';

-- ============================================================
-- 4. POLITICAS RLS
-- ============================================================


ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read active modules"
ON public.modules
FOR SELECT
TO authenticated
USING (is_active = true);