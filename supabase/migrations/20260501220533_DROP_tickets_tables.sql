-- 1. Eliminar las políticas de RLS (Opcional si vas a borrar la tabla, pero útil para limpieza selectiva)
DROP POLICY IF EXISTS "Users can see tickets from their tenants" ON public.tickets;
DROP POLICY IF EXISTS "Users can create tickets in their tenants" ON public.tickets;
DROP POLICY IF EXISTS "Authors can update their own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users can delete own tickets" ON public.tickets;

-- 2. Eliminar la tabla (Esto borra automáticamente índices, particiones y grants)
DROP TABLE IF EXISTS public.tickets CASCADE;