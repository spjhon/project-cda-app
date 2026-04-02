-- 1. La lógica del Trigger
CREATE OR REPLACE FUNCTION public.set_next_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    --aqui lo que se esta diciendo es que se seleccion el maximo ticket_number (esto seria un solo valor dado que lo saca de la columna ticket_number)
    --del from de la tabla tickets en donde el tenant_id de la tabla tickets sea igual al tenant_id que viene del trigger. Se hace la comparacion y de ahi 
    --da como resultado una tabla virtual que es donde coalesce mira, saca el maximo de la columna y le agrega 1
    --NEW es una variable especial que contiene la fila que se está intentando insertar (o actualizar) en ese preciso momento.
    SELECT COALESCE(MAX(ticket_number), 0) + 1 
    INTO NEW.ticket_number
    FROM public.tickets
    WHERE tenant_id = NEW.tenant_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;