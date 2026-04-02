-- Trigger para updated_at (reusas tu misma función)
create trigger set_service_users_updated_at
before update on public.service_users
for each row
execute function public.set_updated_at();

--Trigger updated_at (nombre ajustado a la tabla)
create trigger set_tenant_permissions_updated_at
before update on public.tenant_permissions
for each row
execute function public.set_updated_at();


--Y este es el trigger como tal que lo que hace es hacer la operacion de la funcion por cada fila que se le evidencie el update
create trigger set_tenants_updated_at
before update on public.tenants
for each row
execute function public.set_updated_at();