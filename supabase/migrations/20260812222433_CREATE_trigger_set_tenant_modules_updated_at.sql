--Trigger updated_at (nombre ajustado a la tabla)
create trigger set_tenant_modules_updated_at
before update on public.tenant_modules
for each row
execute function public.set_updated_at();