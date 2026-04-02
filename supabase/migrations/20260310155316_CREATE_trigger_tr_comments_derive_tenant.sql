CREATE TRIGGER tr_comments_derive_tenant
BEFORE INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.derive_tenant_from_ticket();