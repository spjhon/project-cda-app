-- 2. Borramos la de tenant individual (ya no es necesaria)
ALTER TABLE public.comments 
DROP CONSTRAINT IF EXISTS comments_tenant_id_fkey;