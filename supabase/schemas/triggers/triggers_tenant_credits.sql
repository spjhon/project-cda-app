-- ==========================================
-- Trigger sobre la tabla public.tenants
-- ==========================================

CREATE TRIGGER on_tenant_created_add_credits
  AFTER INSERT ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_tenant_credits();


  --Trigger updated_at (nombre ajustado a la tabla)
create trigger set_tenant_credits_updated_at
before update on public.tenant_credits
for each row
execute function public.set_updated_at();