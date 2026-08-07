import { describe, expect, it } from "vitest";
import { isValidOrderStatusTransition, nextOrderStatuses, ORDER_STATUSES } from "@/lib/orders";

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
