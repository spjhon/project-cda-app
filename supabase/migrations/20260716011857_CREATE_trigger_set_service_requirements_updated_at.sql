--Trigger updated_at (nombre ajustado a la tabla)
create trigger set_service_requirements_updated_at
before update on public.service_requirements
for each row
execute function public.set_updated_at();