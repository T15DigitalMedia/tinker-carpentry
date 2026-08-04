alter table coupons enable row level security;

-- No public select policy: coupon codes and details are only ever exposed
-- through validate_coupon(), which checks eligibility without leaking the
-- underlying row. Full CRUD access is admin-only, ahead of the admin
-- coupon management UI (see t5-4).

drop policy if exists "admin select coupons" on coupons;
create policy "admin select coupons" on coupons
  for select using (is_admin());

drop policy if exists "admin insert coupons" on coupons;
create policy "admin insert coupons" on coupons
  for insert with check (is_admin());

drop policy if exists "admin update coupons" on coupons;
create policy "admin update coupons" on coupons
  for update using (is_admin()) with check (is_admin());

drop policy if exists "admin delete coupons" on coupons;
create policy "admin delete coupons" on coupons
  for delete using (is_admin());
