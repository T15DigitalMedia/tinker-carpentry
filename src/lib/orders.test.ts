import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  cancelOrder,
  countOrdersByStatus,
  isValidOrderStatusTransition,
  nextOrderStatuses,
  orderStatRangeStart,
  ordersInRange,
  refundOrderAndRestock,
  summarizeSales,
  trackOrder,
  ORDER_STATUSES,
} from "@/lib/orders";

describe("nextOrderStatuses", () => {
  it("offers the forward step plus cancel/refund from paid", () => {
    expect(nextOrderStatuses("paid")).toEqual(["preparing", "cancelled", "refunded"]);
  });

  it("offers the forward step plus cancel/refund from preparing", () => {
    expect(nextOrderStatuses("preparing")).toEqual(["ready_for_pickup", "cancelled", "refunded"]);
  });

  it("offers the forward step plus cancel/refund from ready_for_pickup", () => {
    expect(nextOrderStatuses("ready_for_pickup")).toEqual(["collected", "cancelled", "refunded"]);
  });

  it("only offers refund from collected", () => {
    expect(nextOrderStatuses("collected")).toEqual(["refunded"]);
  });

  it("offers nothing from terminal states", () => {
    expect(nextOrderStatuses("cancelled")).toEqual([]);
    expect(nextOrderStatuses("refunded")).toEqual([]);
  });
});

describe("isValidOrderStatusTransition", () => {
  it("allows re-saving the same status", () => {
    for (const status of ORDER_STATUSES) {
      expect(isValidOrderStatusTransition(status, status)).toBe(true);
    }
  });

  it("allows forward progression through the happy path", () => {
    expect(isValidOrderStatusTransition("paid", "preparing")).toBe(true);
    expect(isValidOrderStatusTransition("preparing", "ready_for_pickup")).toBe(true);
    expect(isValidOrderStatusTransition("ready_for_pickup", "collected")).toBe(true);
  });

  it("allows cancelling or refunding from any active state", () => {
    expect(isValidOrderStatusTransition("paid", "cancelled")).toBe(true);
    expect(isValidOrderStatusTransition("preparing", "refunded")).toBe(true);
    expect(isValidOrderStatusTransition("ready_for_pickup", "cancelled")).toBe(true);
  });

  it("allows refunding a collected order", () => {
    expect(isValidOrderStatusTransition("collected", "refunded")).toBe(true);
  });

  it("rejects skipping stages", () => {
    expect(isValidOrderStatusTransition("paid", "ready_for_pickup")).toBe(false);
    expect(isValidOrderStatusTransition("paid", "collected")).toBe(false);
  });

  it("rejects moving backward", () => {
    expect(isValidOrderStatusTransition("collected", "ready_for_pickup")).toBe(false);
    expect(isValidOrderStatusTransition("ready_for_pickup", "preparing")).toBe(false);
  });

  it("rejects any transition out of a terminal state other than collected -> refunded", () => {
    expect(isValidOrderStatusTransition("cancelled", "preparing")).toBe(false);
    expect(isValidOrderStatusTransition("refunded", "paid")).toBe(false);
    expect(isValidOrderStatusTransition("collected", "cancelled")).toBe(false);
  });
});

describe("countOrdersByStatus", () => {
  it("zero-fills every status, including ones with no orders", () => {
    const counts = countOrdersByStatus([{ status: "paid" }, { status: "paid" }, { status: "collected" }]);

    expect(counts).toEqual({
      paid: 2,
      preparing: 0,
      ready_for_pickup: 0,
      collected: 1,
      cancelled: 0,
      refunded: 0,
    });
  });

  it("returns all zeros for an empty list", () => {
    expect(countOrdersByStatus([])).toEqual({
      paid: 0,
      preparing: 0,
      ready_for_pickup: 0,
      collected: 0,
      cancelled: 0,
      refunded: 0,
    });
  });
});

describe("summarizeSales", () => {
  it("counts every non-cancelled, non-refunded order as revenue", () => {
    const summary = summarizeSales([
      { status: "paid", total: 1000 },
      { status: "preparing", total: 2000 },
      { status: "ready_for_pickup", total: 3000 },
      { status: "collected", total: 4000 },
    ]);

    expect(summary).toEqual({
      orderCount: 4,
      grossRevenueCents: 10000,
      averageOrderValueCents: 2500,
      refundedCents: 0,
    });
  });

  it("excludes cancelled orders from revenue entirely", () => {
    const summary = summarizeSales([
      { status: "paid", total: 1000 },
      { status: "cancelled", total: 5000 },
    ]);

    expect(summary.orderCount).toBe(1);
    expect(summary.grossRevenueCents).toBe(1000);
  });

  it("excludes refunded orders from revenue but reports the refunded total separately", () => {
    const summary = summarizeSales([
      { status: "paid", total: 1000 },
      { status: "refunded", total: 5000 },
      { status: "refunded", total: 2000 },
    ]);

    expect(summary.orderCount).toBe(1);
    expect(summary.grossRevenueCents).toBe(1000);
    expect(summary.refundedCents).toBe(7000);
  });

  it("rounds the average order value to the nearest cent", () => {
    const summary = summarizeSales([
      { status: "paid", total: 1000 },
      { status: "paid", total: 999 },
      { status: "paid", total: 999 },
    ]);

    expect(summary.averageOrderValueCents).toBe(999); // 2998 / 3 = 999.33...
  });

  it("returns zeros for an empty list without dividing by zero", () => {
    expect(summarizeSales([])).toEqual({
      orderCount: 0,
      grossRevenueCents: 0,
      averageOrderValueCents: 0,
      refundedCents: 0,
    });
  });
});

describe("orderStatRangeStart", () => {
  // 2026-08-08 is a Saturday.
  const now = new Date("2026-08-08T18:00:00.000Z");

  it("starts today's range at midnight UTC the same day", () => {
    expect(orderStatRangeStart("today", now)).toEqual(new Date("2026-08-08T00:00:00.000Z"));
  });

  it("starts this week's range on the preceding Monday", () => {
    expect(orderStatRangeStart("week", now)).toEqual(new Date("2026-08-03T00:00:00.000Z"));
  });

  it("treats a Monday as the start of its own week", () => {
    const monday = new Date("2026-08-03T12:00:00.000Z");
    expect(orderStatRangeStart("week", monday)).toEqual(new Date("2026-08-03T00:00:00.000Z"));
  });

  it("starts this month's range on the 1st", () => {
    expect(orderStatRangeStart("month", now)).toEqual(new Date("2026-08-01T00:00:00.000Z"));
  });

  it("starts this year's range on January 1st", () => {
    expect(orderStatRangeStart("year", now)).toEqual(new Date("2026-01-01T00:00:00.000Z"));
  });
});

describe("ordersInRange", () => {
  const now = new Date("2026-08-08T18:00:00.000Z");

  it("keeps orders on or after the range start and drops earlier ones", () => {
    const orders = [
      { created_at: "2026-08-07T23:59:59.999Z" },
      { created_at: "2026-08-08T00:00:00.000Z" },
      { created_at: "2026-08-08T23:59:59.999Z" },
    ];
    expect(ordersInRange(orders, "today", now)).toEqual([
      { created_at: "2026-08-08T00:00:00.000Z" },
      { created_at: "2026-08-08T23:59:59.999Z" },
    ]);
  });

  it("widens as the range widens", () => {
    const orders = [{ created_at: "2026-08-01T00:00:00.000Z" }, { created_at: "2026-02-01T00:00:00.000Z" }];
    expect(ordersInRange(orders, "today", now)).toEqual([]);
    expect(ordersInRange(orders, "month", now)).toEqual([{ created_at: "2026-08-01T00:00:00.000Z" }]);
    expect(ordersInRange(orders, "year", now)).toEqual(orders);
  });

  it("returns an empty list for an empty input", () => {
    expect(ordersInRange([], "year", now)).toEqual([]);
  });
});

function mockSupabase(result: { data: unknown; error: unknown }) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const rpc = vi.fn().mockReturnValue({ maybeSingle });
  return { client: { rpc } as unknown as SupabaseClient, rpc, maybeSingle };
}

describe("trackOrder", () => {
  it("maps the RPC row to a TrackedOrder when ref and email match", async () => {
    const { client, rpc } = mockSupabase({
      data: {
        order_id: "a1b2c3d4-0000-0000-0000-000000000000",
        status: "ready_for_pickup",
        created_at: "2026-08-08T12:00:00.000Z",
        subtotal: 6500,
        discount_cents: 0,
        tax_cents: 325,
        total: 6825,
        coupon_code: null,
        items: [{ product_name: "Walnut Cutting Board", quantity: 1, unit_price: 6500 }],
      },
      error: null,
    });

    const result = await trackOrder(client, { orderRef: "a1b2c3d4", email: "buyer@example.com" });

    expect(rpc).toHaveBeenCalledWith("get_order_for_tracking", {
      p_order_ref: "a1b2c3d4",
      p_email: "buyer@example.com",
    });
    expect(result).toEqual({
      orderRef: "A1B2C3D4",
      status: "ready_for_pickup",
      createdAt: "2026-08-08T12:00:00.000Z",
      subtotalCents: 6500,
      discountCents: 0,
      taxCents: 325,
      totalCents: 6825,
      couponCode: null,
      items: [{ productName: "Walnut Cutting Board", quantity: 1, unitPriceCents: 6500 }],
    });
  });

  it("returns null when no order matches the ref/email pair", async () => {
    const { client } = mockSupabase({ data: null, error: null });

    const result = await trackOrder(client, { orderRef: "deadbeef", email: "nobody@example.com" });

    expect(result).toBeNull();
  });

  it("throws when the RPC call itself errors", async () => {
    const { client } = mockSupabase({ data: null, error: new Error("connection failed") });

    await expect(trackOrder(client, { orderRef: "a1b2c3d4", email: "buyer@example.com" })).rejects.toThrow(
      "connection failed",
    );
  });
});

function mockSupabaseSingle(result: { data: unknown; error: unknown }) {
  const single = vi.fn().mockResolvedValue(result);
  const rpc = vi.fn().mockReturnValue({ single });
  return { client: { rpc } as unknown as SupabaseClient, rpc, single };
}

describe("cancelOrder", () => {
  it("returns transitioned: true when the RPC cancels a fresh order", async () => {
    const { client, rpc } = mockSupabaseSingle({
      data: { order_id: "order-1", transitioned: true },
      error: null,
    });

    const result = await cancelOrder(client, "order-1");

    expect(rpc).toHaveBeenCalledWith("cancel_order_and_restock", { p_order_id: "order-1" });
    expect(result).toEqual({ orderId: "order-1", transitioned: true });
  });

  it("returns transitioned: false when the order was already cancelled", async () => {
    const { client } = mockSupabaseSingle({
      data: { order_id: "order-1", transitioned: false },
      error: null,
    });

    const result = await cancelOrder(client, "order-1");

    expect(result).toEqual({ orderId: "order-1", transitioned: false });
  });

  it("throws when the RPC call itself errors", async () => {
    const { client } = mockSupabaseSingle({ data: null, error: new Error("not authorized") });

    await expect(cancelOrder(client, "order-1")).rejects.toThrow("not authorized");
  });
});

describe("refundOrderAndRestock", () => {
  it("returns transitioned: true when the RPC refunds a matching order", async () => {
    const { client, rpc } = mockSupabase({
      data: { order_id: "order-1", transitioned: true },
      error: null,
    });

    const result = await refundOrderAndRestock(client, "pi_123");

    expect(rpc).toHaveBeenCalledWith("refund_order_and_restock", { p_stripe_payment_intent_id: "pi_123" });
    expect(result).toEqual({ orderId: "order-1", transitioned: true });
  });

  it("returns null when no order matches the payment intent", async () => {
    const { client } = mockSupabase({ data: null, error: null });

    const result = await refundOrderAndRestock(client, "pi_unknown");

    expect(result).toBeNull();
  });

  it("throws when the RPC call itself errors", async () => {
    const { client } = mockSupabase({ data: null, error: new Error("connection failed") });

    await expect(refundOrderAndRestock(client, "pi_123")).rejects.toThrow("connection failed");
  });
});
