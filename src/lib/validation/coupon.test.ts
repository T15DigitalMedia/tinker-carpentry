import { describe, expect, it } from "vitest";
import { couponCodeSchema } from "@/lib/validation/coupon";

describe("couponCodeSchema", () => {
  it("accepts a normal code", () => {
    expect(couponCodeSchema.safeParse("SAVE10").success).toBe(true);
  });

  it("trims surrounding whitespace", () => {
    const result = couponCodeSchema.safeParse("  SAVE10  ");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("SAVE10");
  });

  it("rejects an empty string", () => {
    expect(couponCodeSchema.safeParse("").success).toBe(false);
  });

  it("rejects a whitespace-only string", () => {
    expect(couponCodeSchema.safeParse("   ").success).toBe(false);
  });

  it("rejects a code over 40 characters", () => {
    expect(couponCodeSchema.safeParse("A".repeat(41)).success).toBe(false);
  });

  it("accepts a code at exactly 40 characters", () => {
    expect(couponCodeSchema.safeParse("A".repeat(40)).success).toBe(true);
  });
});
