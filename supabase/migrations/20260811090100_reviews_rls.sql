alter table reviews enable row level security;

-- Approved reviews are the only ones anyone but the admin should ever see —
-- pending/hidden stay in the moderation queue. Inserts have no public
-- policy at all: they only ever happen through submit_review() below, which
-- verifies the purchase itself rather than trusting a client-supplied
-- product_id/order_id.
drop policy if exists "public select approved reviews" on reviews;
create policy "public select approved reviews" on reviews
  for select using (status = 'approved');

drop policy if exists "admin select reviews" on reviews;
create policy "admin select reviews" on reviews
  for select using (is_admin());

drop policy if exists "admin update reviews" on reviews;
create policy "admin update reviews" on reviews
  for update using (is_admin()) with check (is_admin());

drop policy if exists "admin delete reviews" on reviews;
create policy "admin delete reviews" on reviews
  for delete using (is_admin());
