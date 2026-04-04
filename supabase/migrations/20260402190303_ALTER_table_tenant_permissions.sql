-- 1. Eliminar la restricción actual
-- El nombre por defecto que Postgres suele dar es 'tenant_permissions_role_check'
-- Si le pusiste un nombre manual, usa ese.
ALTER TABLE public.tenant_permissions 
DROP CONSTRAINT IF EXISTS tenant_permissions_role_check;

-- 2. (Opcional) Mapear los roles viejos a los nuevos si ya tienes datos
-- Por ejemplo: 'owner' pasa a ser 'gerente', 'member' a 'directortecnico', etc.
UPDATE public.tenant_permissions SET role = 'gerente' WHERE role = 'owner';
UPDATE public.tenant_permissions SET role = 'director_tecnico' WHERE role = 'admin';
UPDATE public.tenant_permissions SET role = 'recepcionista' WHERE role = 'member';

-- 3. Cambiar el valor por defecto de la columna (antes era 'member')
ALTER TABLE public.tenant_permissions 
ALTER COLUMN role SET DEFAULT 'recepcionista';

-- 4. Añadir la nueva restricción con tus 4 roles
ALTER TABLE public.tenant_permissions 
ADD CONSTRAINT tenant_permissions_role_check 
CHECK (role IN ('gerente', 'recepcionista', 'aux_administrativo', 'director_tecnico'));