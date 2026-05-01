-- 1. Eliminamos la restricción anterior que limitaba a un solo rol por usuario/tenant
ALTER TABLE public.tenant_permissions 
DROP CONSTRAINT IF EXISTS tenant_permissions_unique_pair;

-- 2. Creamos la nueva restricción de triplete único
-- Esto permite:
-- (Tenant A, Usuario 1, 'recepcionista') -> OK
-- (Tenant A, Usuario 1, 'director_tecnico') -> OK (Diferente rol)
-- (Tenant A, Usuario 1, 'recepcionista') -> ERROR (Ya existe este triplete exacto)
ALTER TABLE public.tenant_permissions 
ADD CONSTRAINT tenant_permissions_unique_triplet 
UNIQUE (tenant_id, service_user_id, role);