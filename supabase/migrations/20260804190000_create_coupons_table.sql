create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value int not null check (discount_value > 0),
  min_subtotal int not null default 0,
  usage_limit int,
  times_used int not null default 0,
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint percent_within_range check (discount_type <> 'percent' or discount_value <= 100)
);

-- Case-insensitive uniqueness: "SAVE10" and "save10" are the same code.
create unique index if not exists coupons_code_lower_idx on coupons (lower(code));

drop trigger if exists coupons_set_updated_at on coupons;
create trigger coupons_set_updated_at
  before update on coupons
  for each row
  execute function set_updated_at();
