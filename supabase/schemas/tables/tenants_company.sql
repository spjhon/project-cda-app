
-- ============================================================
-- TABLE: tenants_company
-- ============================================================

CREATE TABLE public.tenants_company (
  id uuid NOT NULL DEFAULT gen_random_uuid(),

  tenant_id uuid NOT NULL,

  nit text NOT NULL,

  name text NOT NULL,

  address text NULL,

  phone text NULL,

  email text NULL,

  created_at timestamp with time zone NOT NULL DEFAULT now(),

  updated_at timestamp with time zone NOT NULL DEFAULT now(),

  deleted_at timestamptz NULL;

  CONSTRAINT tenants_company_pkey
    PRIMARY KEY (id),

  CONSTRAINT tenants_company_tenant_id_fkey
    FOREIGN KEY (tenant_id)
    REFERENCES public.tenants (id)
    ON DELETE CASCADE,

  CONSTRAINT tenants_company_tenant_nit_key
    UNIQUE (tenant_id, nit),

  CONSTRAINT tenants_company_nit_check
    CHECK (length(trim(nit)) > 0),

  CONSTRAINT tenants_company_name_check
    CHECK (length(trim(name)) > 0)
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX tenants_company_tenant_id_idx
  ON public.tenants_company
  USING btree (tenant_id);


-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER set_tenants_company_updated_at
BEFORE UPDATE ON public.tenants_company
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE public.tenants_company IS
  'Empresas cliente registradas por cada CDA (tenant).';

COMMENT ON COLUMN public.tenants_company.id IS
  'Identificador único de la empresa registrada.';

COMMENT ON COLUMN public.tenants_company.tenant_id IS
  'Identificador del tenant CDA al que pertenece la empresa.';

COMMENT ON COLUMN public.tenants_company.nit IS
  'NIT de la empresa, almacenado como texto para conservar su formato.';

COMMENT ON COLUMN public.tenants_company.name IS
  'Nombre o razón social de la empresa.';

COMMENT ON COLUMN public.tenants_company.address IS
  'Dirección física de la empresa.';

COMMENT ON COLUMN public.tenants_company.phone IS
  'Teléfono de contacto de la empresa.';

COMMENT ON COLUMN public.tenants_company.created_at IS
  'Fecha y hora de creación del registro.';

COMMENT ON COLUMN public.tenants_company.updated_at IS
  'Fecha y hora de la última actualización del registro.';

COMMENT ON COLUMN public.tenants_company.email IS
  'Correo electrónico de contacto de la empresa.';

COMMENT ON COLUMN public.tenants_company.deleted_at IS
  'Fecha y hora de eliminación lógica de la empresa. NULL indica que no ha sido eliminada.';


-- ============================================================
-- GRANTS
-- ============================================================

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.tenants_company
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.tenants_company
TO service_role;


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.tenants_company
ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- RLS: SELECT
-- ============================================================

CREATE POLICY select_tenants_company_by_tenant
ON public.tenants_company
FOR SELECT
TO authenticated
USING (
  tenant_id IN (
    SELECT public.get_my_tenants()
  )
);


-- ============================================================
-- RLS: INSERT
-- ============================================================

CREATE POLICY insert_tenants_company_by_tenant
ON public.tenants_company
FOR INSERT
TO authenticated
WITH CHECK (
  tenant_id IN (
    SELECT public.get_my_tenants()
  )
);


-- ============================================================
-- RLS: UPDATE
-- ============================================================

CREATE POLICY update_tenants_company_by_tenant
ON public.tenants_company
FOR UPDATE
TO authenticated
USING (
  tenant_id IN (
    SELECT public.get_my_tenants()
  )
)
WITH CHECK (
  tenant_id IN (
    SELECT public.get_my_tenants()
  )
);


-- ============================================================
-- RLS: DELETE
-- ============================================================

CREATE POLICY delete_tenants_company_by_tenant
ON public.tenants_company
FOR DELETE
TO authenticated
USING (
  tenant_id IN (
    SELECT public.get_my_tenants()
  )
);
