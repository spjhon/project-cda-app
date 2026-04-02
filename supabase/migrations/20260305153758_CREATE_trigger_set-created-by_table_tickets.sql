CREATE TRIGGER tr_set_author
BEFORE INSERT ON public.tickets
FOR EACH ROW EXECUTE FUNCTION public.set_created_by_table_tickets();