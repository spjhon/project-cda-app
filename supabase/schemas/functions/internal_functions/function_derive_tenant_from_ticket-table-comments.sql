create or replace function public.derive_tenant_from_ticket()
returns trigger
language plpgsql
security definer -- Usamos security definer para asegurar acceso a la tabla tickets
set search_path = public
as $$
BEGIN
    -- Obtenemos el tenant_id del ticket relacionado
    NEW.tenant_id := (
        SELECT t.tenant_id 
        FROM public.tickets t 
        WHERE t.id = NEW.ticket_id
    );

    -- Validación de seguridad
    IF NEW.tenant_id IS NULL THEN
        RAISE EXCEPTION 'No se pudo encontrar el ticket relacionado o el ticket no tiene un tenant asignado.';
    END IF;

    RETURN NEW;
END;
$$;