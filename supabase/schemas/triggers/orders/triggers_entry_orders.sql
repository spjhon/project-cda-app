create trigger set_entry_orders_updated_at
before update on public.entry_orders
for each row
execute function public.set_updated_at();