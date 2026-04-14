create trigger set_order_condition_results_updated_at
before update on public.order_condition_results
for each row
execute function public.set_updated_at();