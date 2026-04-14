create trigger set_entry_order_tire_pressures_updated_at
before update on public.entry_order_tire_pressures
for each row
execute function public.set_updated_at();