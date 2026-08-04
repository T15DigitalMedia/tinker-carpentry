-- Runs as security definer so it can check a coupon's eligibility without a
-- public select policy on the coupons table (RLS locks that to admins only).
-- Only ever returns eligibility + the computed discount, never the row itself.
create or replace function validate_coupon(p_code text, p_subtotal int)
returns table (valid boolean, reason text, discount_cents int, coupon_id uuid)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  c coupons%rowtype;
begin
  select * into c from coupons where lower(code) = lower(p_code);

  if not found then
    return query select false, 'not_found'::text, 0, null::uuid;
    return;
  end if;

  if not c.is_active then
    return query select false, 'inactive'::text, 0, c.id;
    return;
  end if;

  if c.expires_at is not null and c.expires_at < now() then
    return query select false, 'expired'::text, 0, c.id;
    return;
  end if;

  if c.usage_limit is not null and c.times_used >= c.usage_limit then
    return query select false, 'usage_limit_reached'::text, 0, c.id;
    return;
  end if;

  if p_subtotal < c.min_subtotal then
    return query select false, 'below_minimum'::text, 0, c.id;
    return;
  end if;

  if c.discount_type = 'percent' then
    return query select true, null::text, least(p_subtotal, (p_subtotal * c.discount_value) / 100), c.id;
  else
    return query select true, null::text, least(p_subtotal, c.discount_value), c.id;
  end if;
end;
$$;

-- This Supabase project does not auto-expose new entities to the Data API
-- (see supabase/config.toml: auto_expose_new_tables), so anon/authenticated
-- need an explicit grant to call this function via supabase.rpc().
grant execute on function validate_coupon(text, int) to anon, authenticated;
