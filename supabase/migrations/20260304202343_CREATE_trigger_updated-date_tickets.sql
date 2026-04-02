create trigger set_tickets_updated_at
before update on public.tickets
for each row
execute function public.set_updated_at();