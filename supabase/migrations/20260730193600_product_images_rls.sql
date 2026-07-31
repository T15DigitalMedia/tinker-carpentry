alter table product_images enable row level security;

drop policy if exists "public read product images" on product_images;
create policy "public read product images" on product_images
  for select using (
    exists (
      select 1 from products
      where products.id = product_images.product_id
        and (products.is_active = true or is_admin())
    )
  );

drop policy if exists "admin insert product images" on product_images;
create policy "admin insert product images" on product_images
  for insert with check (is_admin());

drop policy if exists "admin update product images" on product_images;
create policy "admin update product images" on product_images
  for update using (is_admin());

drop policy if exists "admin delete product images" on product_images;
create policy "admin delete product images" on product_images
  for delete using (is_admin());
