-- Phase 4 (t4-4): guest order tracking. orders has no public select policy
-- (see t3-7's orders_rls.sql) — a customer proves ownership by supplying
-- both the short order reference from their confirmation email and the
-- email address the order was placed under, matched here rather than
-- through RLS, since RLS has no way to check a value the caller supplies
-- in the call itself. The 8-char reference alone isn't guaranteed globally
-- unique, but paired with the required email match a collision is not a
-- realistic concern at this business's scale.
create or replace function get_order_for_tracking(p_order_ref text, p_email text)
returns table (
  order_id uuid,
  status text,
  created_at timestamptz,
  subtotal int,
  discount_cents int,
  tax_cents int,
  total int,
  coupon_code text,
  items jsonb
)
language sql
security definer
set search_path = public
stable
as $$
  select
    o.id,
    o.status,
    o.created_at,
    o.subtotal,
    o.discount_cents,
    o.tax_cents,
    o.total,
    o.coupon_code,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'product_name', oi.product_name,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price
          )
          order by oi.product_name
        )
        from order_items oi
        where oi.order_id = o.id
      ),
      '[]'::jsonb
    )
  from orders o
  where lower(left(o.id::text, 8)) = lower(p_order_ref)
    and lower(o.customer_email) = lower(p_email)
$$;

grant execute on function get_order_for_tracking(text, text) to anon, authenticated;
