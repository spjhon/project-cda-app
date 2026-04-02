CREATE TABLE public.tickets_tenant_globex 
PARTITION OF public.tickets 
FOR VALUES IN ('bbbbbbbb-0000-0000-0000-000000000002');