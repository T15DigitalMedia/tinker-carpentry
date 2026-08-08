-- Phase 4 (t4-5): cancelling or refunding an order releases the stock that
-- was decremented at payment time (see create_order_from_checkout_session).
-- Both are pulled out of the generic status-update path (orders/actions.ts)
-- into dedicated functions because they have a side effect beyond the
-- status column, and — for refunds specifically — the status change must
-- follow Stripe's own confirmation rather than the admin's click, so a
-- refund issued directly from the Stripe dashboard (not through this app)
-- still lands correctly. See the Stripe webhook route for the caller.

-- Admin-initiated: no money moves, so this can run synchronously off the
-- admin's click. security definer bypasses RLS on orders/products, so it
-- must check admin status itself — unlike create_order_from_checkout_session
-- (service_role only, no caller to check) or get_order_for_tracking/
-- validate_coupon (safe to expose broadly since they only ever return
-- narrow, non-destructive results).
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

  -- Let the orders_enforce_status_transition trigger (t4-1) be the single
  -- source of truth for which predecessor states are legal; an illegal
  -- transition (e.g. an already-collected order) raises here and rolls
  -- back, same as a direct UPDATE would.
  update orders set status = 'cancelled' where id = p_order_id;

  for v_item in
    select oi.product_id, oi.quantity from order_items oi where oi.order_id = p_order_id
  loop
    if v_item.product_id is not null then
      update products set stock = stock + v_item.quantity
      where id = v_item.product_id and not made_to_order;
    end if;
  end loop;

  return query select p_order_id, true;
end;
$$;

grant execute on function cancel_order_and_restock(uuid) to authenticated;

-- Webhook-initiated only (service_role): looks the order up by payment
-- intent because the caller here is Stripe's event, not an admin session,
-- and reports whether it actually transitioned so the webhook route sends
-- the "refunded" email exactly once even if Stripe redelivers the event.
-- An order that isn't in a state "refunded" can legally follow from (e.g.
-- already cancelled) is treated as a no-op, not an error — the refund
-- still happened at Stripe, but this app's terminal status stands.
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
      update products set stock = stock + v_item.quantity
      where id = v_item.product_id and not made_to_order;
    end if;
  end loop;

  return query select v_order_id, true;
end;
$$;

grant execute on function refund_order_and_restock(text) to service_role;
