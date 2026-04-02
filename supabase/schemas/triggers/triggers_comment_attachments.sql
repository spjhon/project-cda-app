create trigger tr_set_comments_attachments_updated_at
before update on public.comment_attachments
for each row
execute function public.set_updated_at();
