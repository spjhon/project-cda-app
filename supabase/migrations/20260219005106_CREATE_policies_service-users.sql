
-- ==========================================
-- RLS
-- ==========================================
alter table public.service_users enable row level security;

create policy "Users can read their own service_user"
on public.service_users
for select
to authenticated
using (auth_user_id = auth.uid());

create policy "Users can insert their own service_user"
on public.service_users
for insert
to authenticated
with check (auth_user_id = auth.uid());

create policy "Users can update their own service_user"
on public.service_users
for update
to authenticated
using (auth_user_id = auth.uid())
with check (auth_user_id = auth.uid());

create policy "Users can delete their own service_user"
on public.service_users
for delete
to authenticated
using (auth_user_id = auth.uid());
