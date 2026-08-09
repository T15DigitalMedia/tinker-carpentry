-- Phase 5 (t5-6): pairs with the existing sale_price column. When set, the
-- app treats sale_price as expired once this passes — see
-- effectiveSalePrice() in src/lib/products.ts. Nothing sweeps this
-- automatically (no cron in this project); it's checked lazily wherever a
-- price is read, so a stale sale just stops being honored on its own.
alter table products add column if not exists sale_expires_at timestamptz;
