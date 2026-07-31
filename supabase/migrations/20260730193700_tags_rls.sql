alter table tags enable row level security;
alter table product_tags enable row level security;

drop policy if exists "public read tags" on tags;
create policy "public read tags" on tags
  for select using (true);

drop policy if exists "admin insert tags" on tags;
create policy "admin insert tags" on tags
  for insert with check (is_admin());

drop policy if exists "admin update tags" on tags;
create policy "admin update tags" on tags
  for update using (is_admin());

drop policy if exists "admin delete tags" on tags;
create policy "admin delete tags" on tags
  for delete using (is_admin());

drop policy if exists "public read product_tags" on product_tags;
create policy "public read product_tags" on product_tags
  for select using (true);

drop policy if exists "admin insert product_tags" on product_tags;
create policy "admin insert product_tags" on product_tags
  for insert with check (is_admin());

drop policy if exists "admin delete product_tags" on product_tags;
create policy "admin delete product_tags" on product_tags
  for delete using (is_admin());
