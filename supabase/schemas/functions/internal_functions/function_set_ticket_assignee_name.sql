create or replace function public.set_ticket_assignee_name()
returns trigger
language plpgsql
SECURITY DEFINER
set search_path = public
as $$
begin
-- 1. Si no hay asignado, limpiamos el nombre
    IF (NEW.assignee IS NULL) THEN
        NEW.assignee_name := NULL;
        
        -- 2. Si hay un asignado, intentamos buscar su nombre validando que pertenezca al tenant
    ELSE NEW.assignee_name = (
        SELECT full_name FROM service_users WHERE id = NEW.assignee AND EXISTS (
            SELECT 1 FROM tenant_permissions p WHERE
            p.tenant_id = NEW.tenant_id AND p.service_user_id=NEW.assignee
        )
    );

-- 3. Si no encontramos un usuario válido para ese tenant, invalidamos la asignación
    IF (NEW.assignee_name IS NULL) THEN
    NEW.assignee := NULL;
    END IF;

    END IF;
    RETURN NEW;
end;
$$;




--este codigo extra que por ahora no esta en la migracion es para dar mayor seguridad a una rpc expuesta en el cliente
IF NOT EXISTS (
    SELECT 1 FROM public.tenant_permissions tp
    JOIN public.service_users su ON tp.service_user_id = su.id
    WHERE tp.tenant_id = NEW.tenant_id 
    AND su.auth_user_id = auth.uid()
) THEN
    RAISE EXCEPTION 'Acceso denegado: El usuario no pertenece a este tenant.';
END IF;