-- Admin gating table (originally created manually in Phase 0;
-- captured here so migration history matches the live dev DB).

create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table admins enable row level security;

drop policy if exists "admins can read own row" on admins;
create policy "admins can read own row" on admins
  for select using (auth.uid() = user_id);
