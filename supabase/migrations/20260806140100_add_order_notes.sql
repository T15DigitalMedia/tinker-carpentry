-- Phase 4 (t4-2): free-text internal notes an admin can attach to an order
-- alongside a status change (e.g. "customer asked for gift wrap").

alter table orders add column if not exists notes text;
