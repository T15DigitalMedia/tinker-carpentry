create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table admins enable row level security;

create policy "admins can read own row" on admins
  for select using (auth.uid() = user_id);
