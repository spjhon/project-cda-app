CREATE TABLE public.tickets_tenant_acme 
PARTITION OF public.tickets 
FOR VALUES IN ('aaaaaaaa-0000-0000-0000-000000000001');