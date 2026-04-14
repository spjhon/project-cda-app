create trigger tr_personas_updated_at
before update on public.personas
for each row
execute function public.set_updated_at();