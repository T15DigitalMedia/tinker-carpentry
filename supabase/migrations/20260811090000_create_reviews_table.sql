-- Phase 5 (t5-1/t5-3): verified-purchase reviews. reviewer_email is
-- snapshotted rather than joined to customers (guest checkout is the norm —
-- see the Phase 0 "Customer accounts" decision — so there's often no
-- customer row to join to). unique(order_id, product_id) means one review
-- per purchased line item, enforced at the DB layer rather than just in the
-- submit_review RPC below.
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  order_id uuid not null references orders(id) on delete cascade,
  reviewer_email text not null,
  rating int not null check (rating between 1 and 5),
  body text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'hidden')),
  admin_response text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, product_id)
);

drop trigger if exists reviews_set_updated_at on reviews;
create trigger reviews_set_updated_at
  before update on reviews
  for each row
  execute function set_updated_at();

create index if not exists reviews_product_id_status_idx on reviews (product_id, status);
