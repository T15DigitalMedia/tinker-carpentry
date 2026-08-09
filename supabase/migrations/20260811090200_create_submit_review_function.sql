-- Verified-purchase review submission (t5-1). Proves ownership the same way
-- get_order_for_tracking (t4-4) does — order reference + email, no account
-- — then additionally checks the order actually contains this product and
-- hasn't been cancelled/refunded, so a review can't be pinned to a product
-- that was never bought or a sale that didn't go through. Raises plain
-- exceptions (mirroring cancel_order_and_restock/refund_order_and_restock)
-- rather than returning a reason column, since the caller only ever needs
-- to surface the message, not branch on it.
create or replace function submit_review(
  p_order_ref text,
  p_email text,
  p_product_id uuid,
  p_rating int,
  p_body text
)
returns table (id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_status text;
  v_review_id uuid;
begin
  select o.id, o.status into v_order_id, v_status
  from orders o
  where lower(left(o.id::text, 8)) = lower(p_order_ref)
    and lower(o.customer_email) = lower(p_email);

  if v_order_id is null then
    raise exception 'We could not find an order matching that reference and email.';
  end if;

  if v_status in ('cancelled', 'refunded') then
    raise exception 'This order was % — it is not eligible for a review.', v_status;
  end if;

  if not exists (
    select 1 from order_items oi where oi.order_id = v_order_id and oi.product_id = p_product_id
  ) then
    raise exception 'That order does not include this product.';
  end if;

  begin
    insert into reviews (product_id, order_id, reviewer_email, rating, body)
    values (p_product_id, v_order_id, p_email, p_rating, p_body)
    returning reviews.id into v_review_id;
  exception
    when unique_violation then
      raise exception 'You have already reviewed this product for this order.';
  end;

  return query select v_review_id;
end;
$$;

grant execute on function submit_review(text, text, uuid, int, text) to anon, authenticated;
