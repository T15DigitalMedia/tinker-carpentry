import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export const ORDER_STATUSES = [
  "paid",
  "preparing",
  "ready_for_pickup",
  "collected",
  "cancelled",
  "refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  paid: "Paid",
  preparing: "Preparing",
  ready_for_pickup: "Ready for pickup",
  collected: "Collected",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

// paid/preparing/ready_for_pickup still need admin action; collected is the
// happy ending; cancelled/refunded are closed but not alarming, so they get
// a neutral tone rather than the error red used for destructive actions.
// Shared by the admin dashboard and the public order-tracking page.
export const ORDER_STATUS_TONE: Record<OrderStatus, string> = {
  paid: "border-open/40 bg-open/10 text-open",
  preparing: "border-open/40 bg-open/10 text-open",
  ready_for_pickup: "border-open/40 bg-open/10 text-open",
  collected: "border-ok/40 bg-ok/10 text-ok",
  cancelled: "border-line-strong bg-panel text-ink-3",
  refunded: "border-line-strong bg-panel text-ink-3",
};

// Mirrors the orders_enforce_status_transition trigger (t4-1 migration) so
// the admin UI only ever offers a move the DB will actually accept.
const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  paid: ["preparing", "cancelled", "refunded"],
  preparing: ["ready_for_pickup", "cancelled", "refunded"],
  ready_for_pickup: ["collected", "cancelled", "refunded"],
  collected: ["refunded"],
  cancelled: [],
  refunded: [],
};

export function nextOrderStatuses(current: OrderStatus): OrderStatus[] {
  return ORDER_STATUS_TRANSITIONS[current];
}

export function isValidOrderStatusTransition(from: OrderStatus, to: OrderStatus): boolean {
  return from === to || ORDER_STATUS_TRANSITIONS[from].includes(to);
}

export function countOrdersByStatus(orders: { status: OrderStatus }[]): Record<OrderStatus, number> {
  const counts = Object.fromEntries(ORDER_STATUSES.map((status) => [status, 0])) as Record<OrderStatus, number>;
  for (const order of orders) {
    counts[order.status] += 1;
  }
  return counts;
}

export const ORDER_STAT_RANGES = ["today", "week", "month", "year"] as const;

export type OrderStatRange = (typeof ORDER_STAT_RANGES)[number];

export const ORDER_STAT_RANGE_LABELS: Record<OrderStatRange, string> = {
  today: "Today",
  week: "This week",
  month: "This month",
  year: "This year",
};

// `now` is injectable so this is testable without mocking the clock.
// Boundaries are computed in UTC explicitly (not setHours/setDate/getDay,
// which use the runtime's local timezone) so a range means the same thing
// regardless of what timezone the server or a test runner happens to be in.
// "This week" starts Monday.
export function orderStatRangeStart(range: OrderStatRange, now: Date): Date {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const date = now.getUTCDate();

  switch (range) {
    case "today":
      return new Date(Date.UTC(year, month, date));
    case "week": {
      const daysSinceMonday = (now.getUTCDay() + 6) % 7;
      return new Date(Date.UTC(year, month, date - daysSinceMonday));
    }
    case "month":
      return new Date(Date.UTC(year, month, 1));
    case "year":
      return new Date(Date.UTC(year, 0, 1));
  }
}

export function ordersInRange<T extends { created_at: string }>(
  orders: T[],
  range: OrderStatRange,
  now: Date,
): T[] {
  const start = orderStatRangeStart(range, now);
  return orders.filter((order) => new Date(order.created_at) >= start);
}

export async function listOrders(
  supabase: SupabaseClient<Database>,
  { status }: { status?: OrderStatus } = {},
) {
  let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getOrder(supabase: SupabaseClient<Database>, id: string) {
  const { data, error } = await supabase.from("orders").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export function shortOrderRef(id: string) {
  return id.slice(0, 8).toUpperCase();
}

export async function getOrderItems(supabase: SupabaseClient<Database>, orderId: string) {
  const { data, error } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)
    .order("product_name", { ascending: true });
  if (error) throw error;
  return data;
}

export type TrackedOrder = {
  orderRef: string;
  status: OrderStatus;
  createdAt: string;
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  couponCode: string | null;
  items: { productName: string; quantity: number; unitPriceCents: number }[];
};

// Guest lookup (t4-4): proves ownership via ref + email instead of a
// session, so this goes through the get_order_for_tracking RPC (public,
// security definer) rather than a direct table select — see the t4-4
// migration for why RLS alone can't express this check.
export async function trackOrder(
  supabase: SupabaseClient<Database>,
  { orderRef, email }: { orderRef: string; email: string },
): Promise<TrackedOrder | null> {
  const { data, error } = await supabase
    .rpc("get_order_for_tracking", { p_order_ref: orderRef, p_email: email })
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return {
    orderRef: shortOrderRef(data.order_id),
    status: data.status as OrderStatus,
    createdAt: data.created_at,
    subtotalCents: data.subtotal,
    discountCents: data.discount_cents,
    taxCents: data.tax_cents,
    totalCents: data.total,
    couponCode: data.coupon_code,
    items: data.items.map((item) => ({
      productName: item.product_name,
      quantity: item.quantity,
      unitPriceCents: item.unit_price,
    })),
  };
}
