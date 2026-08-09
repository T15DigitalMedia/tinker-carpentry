-- Phase 5 (t5-6): sitewide/seasonal sales are a bulk write onto the existing
-- sale_price/sale_expires_at columns rather than a separate campaign
-- system, so storefront display and Stripe checkout pricing (both already
-- read sale_price) don't need a second pricing code path. security definer
-- + is_admin() mirrors cancel_order_and_restock (t4-5) — same reasoning:
-- admin-initiated, no money moves here, RLS would otherwise block the
-- cross-row update.
create or replace function apply_bulk_sale(p_discount_percent int, p_tag_id uuid, p_expires_at timestamptz)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  if not is_admin() then
    raise exception 'not authorized';
  end if;

  if p_discount_percent is null or p_discount_percent <= 0 or p_discount_percent > 100 then
    raise exception 'discount percent must be between 1 and 100';
  end if;

  with updated as (
    update products
    set sale_price = round(price * (100 - p_discount_percent) / 100.0)::int,
        sale_expires_at = p_expires_at
    where is_active
      and (p_tag_id is null or id in (select product_id from product_tags where tag_id = p_tag_id))
    returning id
  )
  select count(*) into v_count from updated;

  return v_count;
end;
$$;

grant execute on function apply_bulk_sale(int, uuid, timestamptz) to authenticated;

-- No tag = clear every product currently on sale; a tag scopes the clear to
-- match how it was applied.
create or replace function clear_bulk_sale(p_tag_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  if not is_admin() then
    raise exception 'not authorized';
  end if;

  with updated as (
    update products
    set sale_price = null,
        sale_expires_at = null
    where sale_price is not null
      and (p_tag_id is null or id in (select product_id from product_tags where tag_id = p_tag_id))
    returning id
  )
  select count(*) into v_count from updated;

  return v_count;
end;
$$;

grant execute on function clear_bulk_sale(uuid) to authenticated;
