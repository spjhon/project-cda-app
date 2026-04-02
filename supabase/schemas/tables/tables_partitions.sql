






--OJO, ESTO DE ACA PARA ABAJO ESTA BORRADO, ES EL EJEMPLO DE COMO AGREGAR TABLAS DE PARTICION
CREATE TABLE public.tickets_tenant_acme 
PARTITION OF public.tickets 
FOR VALUES IN ('aaaaaaaa-0000-0000-0000-000000000001');


CREATE TABLE public.tickets_tenant_globex 
PARTITION OF public.tickets 
FOR VALUES IN ('bbbbbbbb-0000-0000-0000-000000000002');

CREATE TABLE public.tickets_tenant_initech 
PARTITION OF public.tickets 
FOR VALUES IN ('cccccccc-0000-0000-0000-000000000003');

CREATE TABLE public.tickets_tenant_umbrella 
PARTITION OF public.tickets 
FOR VALUES IN ('dddddddd-0000-0000-0000-000000000004');



