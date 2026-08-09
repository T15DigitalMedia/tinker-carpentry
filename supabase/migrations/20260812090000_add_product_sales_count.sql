-- Phase 5 (t5-5): a real popularity metric to replace the "newest" stand-in
-- sort (see src/lib/products.ts). Incremented/decremented alongside stock in
-- the order-lifecycle functions below, so it's always in sync with what
-- actually sold rather than computed on the fly from order_items.
alter table products add column if not exists sales_count int not null default 0;
