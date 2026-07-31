alter table customers enable row level security;

drop policy if exists "admin read customers" on customers;
create policy "admin read customers" on customers
  for select using (is_admin());

drop policy if exists "customers read own row" on customers;
create policy "customers read own row" on customers
  for select using (auth.uid() = auth_user_id);

drop policy if exists "admin insert customers" on customers;
create policy "admin insert customers" on customers
  for insert with check (is_admin());

drop policy if exists "admin update customers" on customers;
create policy "admin update customers" on customers
  for update using (is_admin());
