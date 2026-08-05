import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { validateCoupon } from "@/lib/coupons";

function mockSupabase(result: { data: unknown; error: unknown }) {
  const single = vi.fn().mockResolvedValue(result);
  const rpc = vi.fn().mockReturnValue({ single });
  return { client: { rpc } as unknown as SupabaseClient, rpc, single };
}

describe("validateCoupon", () => {
  it("returns a valid result with the discount when the RPC approves the code", async () => {
    const { client, rpc } = mockSupabase({ data: { valid: true, discount_cents: 500 }, error: null });

    const result = await validateCoupon(client, "SAVE5", 2000);

    expect(rpc).toHaveBeenCalledWith("validate_coupon", { p_code: "SAVE5", p_subtotal: 2000 });
    expect(result).toEqual({ valid: true, discountCents: 500 });
  });

  it("returns the rejection reason when the RPC rejects the code", async () => {
    const { client } = mockSupabase({ data: { valid: false, reason: "expired" }, error: null });

    const result = await validateCoupon(client, "OLDCODE", 2000);

    expect(result).toEqual({ valid: false, reason: "expired" });
  });

  it("defaults to not_found when no reason is given for an invalid code", async () => {
    const { client } = mockSupabase({ data: { valid: false, reason: null }, error: null });

    const result = await validateCoupon(client, "MISSING", 2000);

    expect(result).toEqual({ valid: false, reason: "not_found" });
  });

  it("throws when the RPC call itself errors", async () => {
    const { client } = mockSupabase({ data: null, error: new Error("connection failed") });

    await expect(validateCoupon(client, "SAVE5", 2000)).rejects.toThrow("connection failed");
  });
});
