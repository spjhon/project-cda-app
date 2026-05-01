-- 1. Eliminar las políticas de RLS
DROP POLICY IF EXISTS "Users can see comments from their tenants" ON public.comments;
DROP POLICY IF EXISTS "Users can insert comments in their tenants" ON public.comments;
DROP POLICY IF EXISTS "Users can delete comments from their tenats" ON public.comments;

-- 2. Eliminar la tabla (esto borra automáticamente los índices y los grants)
DROP TABLE IF EXISTS public.comments CASCADE;

-- 1. Eliminar las políticas de RLS
DROP POLICY IF EXISTS "Users can see attachments from their tenants" ON public.comment_attachments;
DROP POLICY IF EXISTS "Users can insert attachments into their tenants" ON public.comment_attachments;

-- 2. Eliminar la tabla (esto borra índices, comentarios de tabla y grants automáticamente)
DROP TABLE IF EXISTS public.comment_attachments CASCADE;