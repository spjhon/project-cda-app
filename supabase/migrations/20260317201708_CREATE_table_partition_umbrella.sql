CREATE TABLE public.tickets_tenant_umbrella 
PARTITION OF public.tickets 
FOR VALUES IN ('dddddddd-0000-0000-0000-000000000004');