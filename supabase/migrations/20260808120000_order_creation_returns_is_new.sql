-- Phase 4 (t4-3): the webhook needs to know whether this call actually
-- created the order or just returned the existing one from an idempotent
-- retry, so it sends the confirmation email exactly once per order rather
-- than never (skip on retry) or repeatedly (send on every retry).

drop function if exists create_order_from_checkout_session(text, text, text, text, int, int, int, int, text, jsonb);

create function create_order_from_checkout_session(
  p_stripe_checkout_session_id text,
  p_stripe_payment_intent_id text,
  p_customer_email text,
  p_customer_phone text,
  p_subtotal int,
  p_discount_cents int,
  p_tax_cents int,
  p_total int,
  p_coupon_code text,
  p_items jsonb
)
returns table (order_id uuid, is_new boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_item jsonb;
  v_product_id uuid;
  v_quantity int;
  v_made_to_order boolean;
  v_stock int;
begin
  -- Idempotency: Stripe can and will deliver the same webhook event more
  -- than once. A retry for an already-fulfilled session must not double up
  -- on stock decrements or coupon usage.
  select id into v_order_id from orders where stripe_checkout_session_id = p_stripe_checkout_session_id;
  if v_order_id is not null then
    return query select v_order_id, false;
    return;
  end if;

  insert into orders (
    stripe_checkout_session_id, stripe_payment_intent_id, customer_email, customer_phone,
    subtotal, discount_cents, tax_cents, total, coupon_code
  ) values (
    p_stripe_checkout_session_id, p_stripe_payment_intent_id, p_customer_email, p_customer_phone,
    p_subtotal, p_discount_cents, p_tax_cents, p_total, p_coupon_code
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := nullif(v_item->>'product_id', '')::uuid;
    v_quantity := (v_item->>'quantity')::int;

    insert into order_items (order_id, product_id, product_name, unit_price, quantity)
    values (v_order_id, v_product_id, v_item->>'product_name', (v_item->>'unit_price')::int, v_quantity);

    if v_product_id is not null then
      -- Lock the row so concurrent fulfillments of the same product
      -- serialize instead of racing on the read-then-write.
      select made_to_order, stock into v_made_to_order, v_stock
      from products where id = v_product_id for update;

      -- Payment is already captured by this point, so a product that's
      -- oversold or since deleted still needs its order recorded — stock
      -- is clamped to zero rather than the order being rejected.
      if found and not v_made_to_order then
        update products set stock = greatest(0, v_stock - v_quantity) where id = v_product_id;
      end if;
    end if;
  end loop;

  if p_coupon_code is not null then
    update coupons set times_used = times_used + 1 where lower(code) = lower(p_coupon_code);
  end if;

  return query select v_order_id, true;
end;
$$;

grant execute on function create_order_from_checkout_session(text, text, text, text, int, int, int, int, text, jsonb) to service_role;
