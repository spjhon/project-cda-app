ALTER TABLE public.tenants_company
  ADD COLUMN deleted_at timestamptz NULL;

COMMENT ON COLUMN public.tenants_company.deleted_at IS
  'Fecha y hora de eliminación lógica de la empresa. NULL indica que no ha sido eliminada.';