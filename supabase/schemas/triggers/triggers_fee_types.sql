--Trigger updated_at (nombre ajustado a la tabla)
create trigger set_fee_types_updated_at
before update on public.fee_types
for each row
execute function public.set_updated_at();