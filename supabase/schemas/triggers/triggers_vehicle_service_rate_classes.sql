create trigger set_vehicle_service_rate_classes_updated_at
before update on public.vehicle_service_rate_classes
for each row
execute function public.set_updated_at();