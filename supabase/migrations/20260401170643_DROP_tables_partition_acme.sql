ALTER TABLE public.tickets DETACH PARTITION public.tickets_tenant_acme;
ALTER TABLE public.tickets DETACH PARTITION public.tickets_tenant_globex;
ALTER TABLE public.tickets DETACH PARTITION public.tickets_tenant_umbrella;

DROP TABLE IF EXISTS public.tickets_tenant_acme;
DROP TABLE IF EXISTS public.tickets_tenant_globex;
DROP TABLE IF EXISTS public.tickets_tenant_umbrella;