-- ==========================================
-- Tabla: tenant_credits
-- ==========================================

CREATE TABLE public.tenant_credits (
    -- Identificadores
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,

    -- Balances / Saldos de Cupos
    cupo_fupas          INTEGER NOT NULL DEFAULT 0,
    cupo_certificados   INTEGER NOT NULL DEFAULT 0,

    -- Auditoría
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- FOREIGN KEYS (Relaciones)
-- ==========================================

ALTER TABLE public.tenant_credits
    ADD CONSTRAINT tenant_credits_tenant_id_fkey 
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- ==========================================
-- CONSTRAINTS (Validaciones y Unicidad)
-- ==========================================

-- 1. Unicidad: Cada tenant solo puede tener un registro de créditos
ALTER TABLE public.tenant_credits
    ADD CONSTRAINT tenant_credits_tenant_id_key 
    UNIQUE (tenant_id);

-- 2. Restricción: Evitar saldos negativos en FUPAS
ALTER TABLE public.tenant_credits
    ADD CONSTRAINT tenant_credits_cupo_fupas_check 
    CHECK (cupo_fupas >= 0);

-- 3. Restricción: Evitar saldos negativos en Certificados RTM
ALTER TABLE public.tenant_credits
    ADD CONSTRAINT tenant_credits_cupo_certificados_check 
    CHECK (cupo_certificados >= 0);



-- ==========================================
-- COMENTARIOS
-- ==========================================

COMMENT ON TABLE public.tenant_credits IS 'Gestión de saldos y cupos disponibles (FUPAS y Certificados RUNT) por cada CDA / Tenant.';
COMMENT ON COLUMN public.tenant_credits.tenant_id IS 'UUID del CDA al que pertenecen los cupos disponibles.';
COMMENT ON COLUMN public.tenant_credits.cupo_fupas IS 'Cantidad actual de cupos FUPAS asignados/comprados pendientes por consumir.';
COMMENT ON COLUMN public.tenant_credits.cupo_certificados IS 'Cantidad actual de cupos de Certificados RTM asignados/comprados pendientes por consumir.';

-- ==========================================
-- Índices estratégicos
-- ==========================================

CREATE INDEX tenant_credits_tenant_id_idx ON public.tenant_credits (tenant_id);

-- ==========================================
-- GRANTS
-- ==========================================

GRANT SELECT ON TABLE public.tenant_credits TO authenticated;
GRANT ALL ON TABLE public.tenant_credits TO service_role;


-- ==========================================
-- RLS (Row Level Security)
-- ==========================================

ALTER TABLE public.tenant_credits ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- POLÍTICAS DE LECTURA (SELECT)
-- ==========================================

-- 1. Los usuarios autenticados pueden ver los cupos únicamente de sus tenants asignados
CREATE POLICY "Users can read tenant credits of their assigned tenants"
ON public.tenant_credits
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
-- POLÍTICAS DE EDICIÓN (UPDATE)
-- ==========================================

-- 2. Permitir actualizar saldos si el usuario pertenece al tenant 
-- (Opcionalmente filtrado por roles administrativos como 'aux_administrativo' o 'gerente')
CREATE POLICY "Authorized users can update tenant credits"
ON public.tenant_credits
FOR UPDATE
TO authenticated
USING (
  tenant_id IN (
    SELECT tp.tenant_id
    FROM public.tenant_permissions tp
    JOIN public.service_users su ON su.id = tp.service_user_id
    WHERE su.auth_user_id = (SELECT auth.uid())
      AND tp.role IN ('gerente', 'aux_administrativo', 'director_tecnico')
  )
)
WITH CHECK (
  tenant_id IN (
    SELECT tp.tenant_id
    FROM public.tenant_permissions tp
    JOIN public.service_users su ON su.id = tp.service_user_id
    WHERE su.auth_user_id = (SELECT auth.uid())
      AND tp.role IN ('gerente', 'aux_administrativo', 'director_tecnico')
  )
);