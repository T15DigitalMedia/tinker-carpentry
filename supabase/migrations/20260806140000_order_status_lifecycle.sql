-- Phase 4 (t4-1): the full order status lifecycle. The webhook (t3-7) only
-- ever writes "paid"; admins now move orders through fulfillment (t4-2), so
-- the DB enforces which transitions are legal so a client bug or stale form
-- can't skip backward or reopen an order that's already cancelled/refunded.

alter table orders drop constraint if exists orders_status_check;
alter table orders add constraint orders_status_check
  check (status in ('paid', 'preparing', 'ready_for_pickup', 'collected', 'cancelled', 'refunded'));

create or replace function enforce_order_status_transition()
returns trigger
language plpgsql
as $$
begin
  -- Re-saving the current status (e.g. a form submit that only changed
  -- notes) is a no-op, not a transition.
  if new.status = old.status then
    return new;
  end if;

  if not (
    (old.status = 'paid' and new.status in ('preparing', 'cancelled', 'refunded')) or
    (old.status = 'preparing' and new.status in ('ready_for_pickup', 'cancelled', 'refunded')) or
    (old.status = 'ready_for_pickup' and new.status in ('collected', 'cancelled', 'refunded')) or
    (old.status = 'collected' and new.status = 'refunded')
  ) then
    raise exception 'invalid order status transition: % -> %', old.status, new.status;
  end if;

  return new;
end;
$$;

drop trigger if exists orders_enforce_status_transition on orders;
create trigger orders_enforce_status_transition
  before update of status on orders
  for each row
  execute function enforce_order_status_transition();
