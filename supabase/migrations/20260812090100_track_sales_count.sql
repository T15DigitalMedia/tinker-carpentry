-- Phase 5 (t5-5): wire sales_count into the same three functions that
-- already move stock, so popularity tracks every sale — including
-- made-to-order items, which don't move stock but should still count.

create or replace function create_order_from_checkout_session(
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
      select made_to_order, stock into v_made_to_order, v_stock
      from products where id = v_product_id for update;

      if found then
        -- Counted for every sold item, made-to-order or not — popularity
        -- reflects demand, not just what's stock-tracked.
        update products set sales_count = sales_count + v_quantity where id = v_product_id;

        if not v_made_to_order then
          update products set stock = greatest(0, v_stock - v_quantity) where id = v_product_id;
        end if;
      end if;
    end if;
  end loop;

  if p_coupon_code is not null then
    update coupons set times_used = times_used + 1 where lower(code) = lower(p_coupon_code);
  end if;

  return query select v_order_id, true;
end;
$$;

create or replace function cancel_order_and_restock(p_order_id uuid)
returns table (order_id uuid, transitioned boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_item record;
begin
  if not is_admin() then
    raise exception 'not authorized';
  end if;

  select status into v_status from orders where id = p_order_id for update;
  if not found then
    raise exception 'order not found';
  end if;

  if v_status = 'cancelled' then
    return query select p_order_id, false;
    return;
  end if;

  update orders set status = 'cancelled' where id = p_order_id;

  for v_item in
    select oi.product_id, oi.quantity from order_items oi where oi.order_id = p_order_id
  loop
    if v_item.product_id is not null then
      update products set sales_count = greatest(0, sales_count - v_item.quantity) where id = v_item.product_id;
      update products set stock = stock + v_item.quantity
      where id = v_item.product_id and not made_to_order;
    end if;
  end loop;

  return query select p_order_id, true;
end;
$$;

create or replace function refund_order_and_restock(p_stripe_payment_intent_id text)
returns table (order_id uuid, transitioned boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_status text;
  v_item record;
begin
  select id, status into v_order_id, v_status
  from orders
  where stripe_payment_intent_id = p_stripe_payment_intent_id
  for update;

  if not found then
    return;
  end if;

  if v_status not in ('paid', 'preparing', 'ready_for_pickup', 'collected') then
    return query select v_order_id, false;
    return;
  end if;

  update orders set status = 'refunded' where id = v_order_id;

  for v_item in
    select oi.product_id, oi.quantity from order_items oi where oi.order_id = v_order_id
  loop
    if v_item.product_id is not null then
      update products set sales_count = greatest(0, sales_count - v_item.quantity) where id = v_item.product_id;
      update products set stock = stock + v_item.quantity
      where id = v_item.product_id and not made_to_order;
    end if;
  end loop;

  return query select v_order_id, true;
end;
$$;
