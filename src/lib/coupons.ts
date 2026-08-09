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

// Admin CRUD reads (t5-4) — writes go straight through actions.ts, same as
// products, since there's no shared logic beyond a plain insert/update.
export async function listCoupons(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getCoupon(supabase: SupabaseClient<Database>, id: string) {
  const { data, error } = await supabase.from("coupons").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}
