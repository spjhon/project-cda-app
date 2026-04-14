create trigger set_order_template_conditions_updated_at
before update on public.order_template_conditions
for each row
execute function public.set_updated_at();