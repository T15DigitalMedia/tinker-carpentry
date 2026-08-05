alter table orders enable row level security;
alter table order_items enable row level security;

-- No public select policy yet: guest order tracking (t4-4) will add a
-- narrower policy (e.g. lookup by order id + email) when it's built. For now
-- orders are only readable by admins; all writes go through
-- create_order_from_checkout_session(), which is security definer.

drop policy if exists "admin select orders" on orders;
create policy "admin select orders" on orders
  for select using (is_admin());

drop policy if exists "admin update orders" on orders;
create policy "admin update orders" on orders
  for update using (is_admin()) with check (is_admin());

drop policy if exists "admin select order_items" on order_items;
create policy "admin select order_items" on order_items
  for select using (is_admin());
