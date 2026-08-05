-- Minimal fields to record a paid order from the webhook (t3-7). The full
-- status lifecycle (preparing / ready for pickup / collected / etc.) is
-- built out in t4-1; "paid" is just the starting state.
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text,
  customer_email text not null,
  customer_phone text,
  subtotal int not null,
  discount_cents int not null default 0,
  tax_cents int not null default 0,
  total int not null,
  coupon_code text,
  status text not null default 'paid',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists orders_set_updated_at on orders;
create trigger orders_set_updated_at
  before update on orders
  for each row
  execute function set_updated_at();

-- product_id/product_name/unit_price are snapshotted at order time so order
-- history survives a product being edited or deleted later.
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  unit_price int not null,
  quantity int not null check (quantity > 0)
);
