-- ============================================================
-- 1. EVIDENCIA DE CONSULTAS SARLAFT
-- ============================================================

CREATE TABLE public.sarlaft_module (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tenant propietario de la evidencia.
    tenant_id UUID NOT NULL,

    -- Orden de entrada asociada.
    entry_order_id UUID NOT NULL,

    -- Identifica si la consulta corresponde al cliente
    -- o al propietario de la orden.
    person_type TEXT NOT NULL,

    -- Snapshot del vehículo consultado.
    placa_snapshot VARCHAR NOT NULL,

    -- Snapshot de la persona consultada.
    nombre_completo_snapshot TEXT NOT NULL,
    tipo_documento_snapshot TEXT NOT NULL,
    numero_documento_snapshot VARCHAR NOT NULL,

    -- Información declarada por la persona.
    actividad_economica_snapshot TEXT NOT NULL,
    origen_fondos_snapshot TEXT NOT NULL,
    es_persona_publicamente_expuesta_snapshot BOOLEAN NOT NULL,

    -- Registro de creación.
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Registro de última actualización.
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Borrado lógico.
    deleted_at TIMESTAMPTZ NULL,

    -- ========================================================
    -- CONSTRAINTS
    -- ========================================================

    CONSTRAINT sarlaft_tenant_id_fkey
        FOREIGN KEY (tenant_id)
        REFERENCES public.tenants (id)
        ON DELETE CASCADE,

    CONSTRAINT sarlaft_entry_order_id_fkey
        FOREIGN KEY (entry_order_id)
        REFERENCES public.entry_orders (id)
        ON DELETE CASCADE,

    CONSTRAINT sarlaft_person_type_check
        CHECK (person_type IN ('customer', 'owner'))
);



-- ==========================================
-- ÍNDICES ESTRATÉGICOS
-- ==========================================

-- Búsqueda de evidencias por tenant.
CREATE INDEX sarlaft_module_tenant_id_idx
ON public.sarlaft_module (tenant_id);

-- Búsqueda de evidencias asociadas a una orden.
CREATE INDEX sarlaft_module_entry_order_id_idx
ON public.sarlaft_module (entry_order_id);

-- Permite consultar rápidamente las evidencias de un tenant
-- asociadas a sus órdenes.
CREATE INDEX sarlaft_module_tenant_entry_order_idx
ON public.sarlaft_module (tenant_id, entry_order_id);

-- Consultas por persona dentro de un tenant.
CREATE INDEX sarlaft_module_tenant_documento_idx
ON public.sarlaft_module (
    tenant_id,
    tipo_documento_snapshot,
    numero_documento_snapshot
);




-- ==========================================
-- COMENTARIOS
-- ==========================================

COMMENT ON TABLE public.sarlaft_module IS
'Evidencia histórica de las consultas SARLAFT realizadas sobre clientes y propietarios durante el proceso de una orden de entrada.';

COMMENT ON COLUMN public.sarlaft_module.id IS
'Identificador único de la evidencia de consulta SARLAFT.';

COMMENT ON COLUMN public.sarlaft_module.tenant_id IS
'UUID del CDA / tenant al que pertenece la evidencia.';

COMMENT ON COLUMN public.sarlaft_module.entry_order_id IS
'UUID de la orden de entrada en la que se realizó la consulta SARLAFT.';

COMMENT ON COLUMN public.sarlaft_module.person_type IS
'Identifica a quién corresponde la consulta: customer para cliente u owner para propietario.';

COMMENT ON COLUMN public.sarlaft_module.placa_snapshot IS
'Placa del vehículo asociada a la consulta SARLAFT en el momento de su realización.';

COMMENT ON COLUMN public.sarlaft_module.nombre_completo_snapshot IS
'Nombre completo de la persona consultada conservado como snapshot histórico.';

COMMENT ON COLUMN public.sarlaft_module.tipo_documento_snapshot IS
'Tipo de documento de la persona consultada conservado como snapshot histórico.';

COMMENT ON COLUMN public.sarlaft_module.numero_documento_snapshot IS
'Número de documento de la persona consultada conservado como snapshot histórico.';

COMMENT ON COLUMN public.sarlaft_module.actividad_economica_snapshot IS
'Actividad económica declarada por la persona al momento de la consulta SARLAFT.';

COMMENT ON COLUMN public.sarlaft_module.origen_fondos_snapshot IS
'Origen de los fondos declarado por la persona al momento de la consulta SARLAFT.';

COMMENT ON COLUMN public.sarlaft_module.es_persona_publicamente_expuesta_snapshot IS
'Indica si la persona fue identificada como Persona Expuesta Políticamente / Públicamente Expuesta al momento de la consulta.';

COMMENT ON COLUMN public.sarlaft_module.created_at IS
'Fecha y hora en que se creó la evidencia de la consulta SARLAFT.';

COMMENT ON COLUMN public.sarlaft_module.updated_at IS
'Fecha y hora de la última actualización de la evidencia.';

COMMENT ON COLUMN public.sarlaft_module.deleted_at IS
'Fecha y hora del borrado lógico de la evidencia. NULL indica que el registro se encuentra activo.';


-- ==========================================
-- GRANTS
-- ==========================================

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.sarlaft_module
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.sarlaft_module
TO service_role;


-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

ALTER TABLE public.sarlaft_module ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- SELECT: Solo puede consultar evidencias SARLAFT
-- de los tenants a los que pertenece el usuario
-- ============================================================

CREATE POLICY "select_sarlaft_by_tenant"
ON public.sarlaft_module
FOR SELECT
TO authenticated
USING (
    tenant_id IN (
        SELECT public.get_my_tenants()
    )
);


-- ============================================================
-- INSERT: Solo puede crear evidencias SARLAFT
-- para los tenants a los que pertenece el usuario
-- ============================================================

CREATE POLICY "insert_sarlaft_by_tenant"
ON public.sarlaft_module
FOR INSERT
TO authenticated
WITH CHECK (
    tenant_id IN (
        SELECT public.get_my_tenants()
    )
);