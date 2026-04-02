create policy "Users can read their own service_user"
on public.service_users
for select
to authenticated
using (auth_user_id = auth.uid());