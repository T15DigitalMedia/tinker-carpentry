import { describe, expect, it } from "vitest";
import {
  countOrdersByStatus,
  isValidOrderStatusTransition,
  nextOrderStatuses,
  orderStatRangeStart,
  ordersInRange,
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
