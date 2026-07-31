insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "public read product images storage" on storage.objects;
create policy "public read product images storage" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "admin insert product images storage" on storage.objects;
create policy "admin insert product images storage" on storage.objects
  for insert with check (bucket_id = 'product-images' and is_admin());

drop policy if exists "admin update product images storage" on storage.objects;
create policy "admin update product images storage" on storage.objects
  for update using (bucket_id = 'product-images' and is_admin());

drop policy if exists "admin delete product images storage" on storage.objects;
create policy "admin delete product images storage" on storage.objects
  for delete using (bucket_id = 'product-images' and is_admin());
