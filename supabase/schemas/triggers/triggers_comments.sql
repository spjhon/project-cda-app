create trigger set_comments_updated_at
before update on public.comments
for each row
execute function public.set_updated_at();




-- Trigger para asignar automaticamente el nombre del creador al comentario
CREATE TRIGGER trg_comments_autoset_author_name
BEFORE INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.set_comment_author_name();


CREATE TRIGGER tr_comments_autoset_created_by
BEFORE INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.set_created_by_value();



CREATE TRIGGER tr_comments_derive_tenant
BEFORE INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.derive_tenant_from_ticket();