--Trigger updated_at (nombre ajustado a la tabla)
create trigger set_sarlaft_module_updated_at
before update on public.sarlaft_module
for each row
execute function public.set_updated_at();