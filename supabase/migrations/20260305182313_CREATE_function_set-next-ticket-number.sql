-- 1. La lógica del Trigger
CREATE OR REPLACE FUNCTION public.set_next_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    SELECT COALESCE(MAX(ticket_number), 0) + 1 
    INTO NEW.ticket_number
    FROM public.tickets
    WHERE tenant_id = NEW.tenant_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;