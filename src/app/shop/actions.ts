"use server";

import { createClient } from "@/lib/supabase/server";
import { listStorefrontProductsPage, toProductCardData, type StorefrontFilters } from "@/lib/products";
import { validateCoupon, type CouponValidationResult } from "@/lib/coupons";
import { couponCodeSchema } from "@/lib/validation/coupon";

export async function loadMoreProducts(filters: StorefrontFilters, offset: number) {
  const supabase = await createClient();
  const { products, hasMore } = await listStorefrontProductsPage(supabase, filters, offset);
  const cards = await toProductCardData(supabase, products);
  return { cards, hasMore };
}

export async function applyCoupon(code: string, subtotal: number): Promise<CouponValidationResult> {
  const parsedCode = couponCodeSchema.safeParse(code);
  if (!parsedCode.success) {
    return { valid: false, reason: "not_found" };
  }

  const supabase = await createClient();
  return validateCoupon(supabase, parsedCode.data, Math.max(0, Math.trunc(subtotal)));
}
