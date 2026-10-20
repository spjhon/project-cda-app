
CREATE TRIGGER set_tenants_company_updated_at
BEFORE UPDATE ON public.tenants_company
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();