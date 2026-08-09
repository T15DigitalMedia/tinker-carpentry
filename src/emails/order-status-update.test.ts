import { describe, expect, it } from "vitest";
import { hasStatusUpdateEmail, ORDER_STATUS_EMAIL_COPY } from "@/emails/order-status-update";
import { ORDER_STATUSES } from "@/lib/orders";

describe("hasStatusUpdateEmail", () => {
  it("has copy for every status it says has an email", () => {
    for (const status of ORDER_STATUSES) {
      expect(hasStatusUpdateEmail(status)).toBe(status in ORDER_STATUS_EMAIL_COPY);
    }
  });

  it("skips paid (confirmation email covers it) and collected (customer is already here)", () => {
    expect(hasStatusUpdateEmail("paid")).toBe(false);
    expect(hasStatusUpdateEmail("collected")).toBe(false);
  });

  it("covers the statuses a customer needs to hear about", () => {
    expect(hasStatusUpdateEmail("preparing")).toBe(true);
    expect(hasStatusUpdateEmail("ready_for_pickup")).toBe(true);
    expect(hasStatusUpdateEmail("cancelled")).toBe(true);
    expect(hasStatusUpdateEmail("refunded")).toBe(true);
  });
});
