CREATE TRIGGER tr_comments_autoset_created_by
BEFORE INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.set_created_by_value();