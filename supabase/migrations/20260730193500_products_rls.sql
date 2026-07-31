alter table products enable row level security;

drop policy if exists "public read active products" on products;
create policy "public read active products" on products
  for select using (is_active = true or is_admin());

drop policy if exists "admin insert products" on products;
create policy "admin insert products" on products
  for insert with check (is_admin());

drop policy if exists "admin update products" on products;
create policy "admin update products" on products
  for update using (is_admin());

drop policy if exists "admin delete products" on products;
create policy "admin delete products" on products
  for delete using (is_admin());
