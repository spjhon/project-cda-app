create trigger set_comments_updated_at
before update on public.comments
for each row
execute function public.set_updated_at();