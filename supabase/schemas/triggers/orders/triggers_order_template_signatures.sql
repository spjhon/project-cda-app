create trigger tr_order_template_signatures_updated_at
before update on public.order_template_signatures
for each row
execute function public.set_updated_at();