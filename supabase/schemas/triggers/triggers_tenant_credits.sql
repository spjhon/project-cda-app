-- ==========================================
-- Trigger sobre la tabla public.tenants
-- ==========================================

CREATE TRIGGER on_tenant_created_add_credits
  AFTER INSERT ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_tenant_credits();


