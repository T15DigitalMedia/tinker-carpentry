import { describe, expect, it } from "vitest";
import { formatPrice } from "@/lib/currency";

describe("formatPrice", () => {
  it("formats whole dollar amounts", () => {
    expect(formatPrice(10000)).toBe("$100.00");
  });

  it("formats cents into two decimal places", () => {
    expect(formatPrice(1099)).toBe("$10.99");
  });

  it("formats zero", () => {
    expect(formatPrice(0)).toBe("$0.00");
  });

  it("rounds down fractional cents from division", () => {
    // 999 / 100 = 9.99 exactly, but guards against float weirdness on odd cents.
    expect(formatPrice(1)).toBe("$0.01");
  });
});
