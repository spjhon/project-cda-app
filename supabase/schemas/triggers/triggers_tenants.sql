--Y este es el trigger como tal que lo que hace es hacer la operacion de la funcion por cada fila que se le evidencie el update
create trigger set_tenants_updated_at
before update on public.tenants
for each row
execute function public.set_updated_at();