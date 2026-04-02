CREATE TRIGGER tr_set_ticket_number
BEFORE INSERT ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION public.set_next_ticket_number();