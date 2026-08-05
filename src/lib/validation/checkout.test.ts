import { describe, expect, it } from "vitest";
import { checkoutInputSchema } from "@/lib/validation/checkout";

const validItem = { productId: "123e4567-e89b-12d3-a456-426614174000", quantity: 1 };

describe("checkoutInputSchema", () => {
  it("accepts a valid cart with no coupon", () => {
    const result = checkoutInputSchema.safeParse({ items: [validItem] });
    expect(result.success).toBe(true);
  });

  it("accepts a valid cart with a coupon code", () => {
    const result = checkoutInputSchema.safeParse({ items: [validItem], couponCode: "SAVE10" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty cart", () => {
    const result = checkoutInputSchema.safeParse({ items: [] });
    expect(result.success).toBe(false);
  });

  it("rejects a non-uuid productId", () => {
    const result = checkoutInputSchema.safeParse({ items: [{ productId: "not-a-uuid", quantity: 1 }] });
    expect(result.success).toBe(false);
  });

  it("rejects a zero or negative quantity", () => {
    expect(checkoutInputSchema.safeParse({ items: [{ ...validItem, quantity: 0 }] }).success).toBe(false);
    expect(checkoutInputSchema.safeParse({ items: [{ ...validItem, quantity: -1 }] }).success).toBe(false);
  });

  it("rejects a non-integer quantity", () => {
    const result = checkoutInputSchema.safeParse({ items: [{ ...validItem, quantity: 1.5 }] });
    expect(result.success).toBe(false);
  });
});
