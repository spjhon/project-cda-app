create trigger tr_vehicles_updated_at
before update on public.vehicles
for each row
execute function public.set_updated_at();