import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export type CouponRejectionReason =
  | "not_found"
  | "inactive"
  | "expired"
  | "usage_limit_reached"
  | "below_minimum";

export type CouponValidationResult =
  | { valid: true; discountCents: number }
  | { valid: false; reason: CouponRejectionReason };

export async function validateCoupon(
  supabase: SupabaseClient<Database>,
  code: string,
  subtotal: number,
): Promise<CouponValidationResult> {
  const { data, error } = await supabase
    .rpc("validate_coupon", { p_code: code, p_subtotal: subtotal })
    .single();
  if (error) throw error;

  if (data.valid) {
    return { valid: true, discountCents: data.discount_cents };
  }
  return { valid: false, reason: (data.reason ?? "not_found") as CouponRejectionReason };
}
