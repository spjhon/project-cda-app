CREATE TRIGGER trg_comments_autoset_author_name
BEFORE INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.set_comment_author_name();