import type { Database } from "@/lib/database.types";

export type OrderStatus = Database["public"]["Tables"]["orders"]["Row"]["status"];

export const ORDER_STATUSES: OrderStatus[] = [
  "paid",
  "preparing",
  "ready_for_pickup",
  "collected",
  "cancelled",
  "refunded",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  paid: "Paid",
  preparing: "Preparing",
  ready_for_pickup: "Ready for pickup",
  collected: "Collected",
  cancelled: "Cancelled",
  refunded: "Refunded",
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
