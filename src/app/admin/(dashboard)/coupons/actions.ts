"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { couponAdminSchema, type CouponAdminFieldKey } from "@/lib/validation/coupon-admin";

export type CouponFormState = {
  error?: string;
  fieldErrors?: Partial<Record<CouponAdminFieldKey, string[]>>;
} | undefined;

function rawFromForm(formData: FormData) {
  return {
    code: formData.get("code"),
    discount_type: formData.get("discount_type"),
    discount_value: formData.get("discount_value"),
    min_subtotal: formData.get("min_subtotal"),
    usage_limit: formData.get("usage_limit"),
    expires_at: formData.get("expires_at"),
    is_active: formData.get("is_active") === "on",
  };
}

function toDbFields(data: ReturnType<typeof couponAdminSchema.parse>) {
  return {
    code: data.code,
    discount_type: data.discount_type,
    discount_value:
      data.discount_type === "fixed" ? Math.round(data.discount_value * 100) : Math.round(data.discount_value),
    min_subtotal: Math.round(data.min_subtotal * 100),
    usage_limit: data.usage_limit ?? null,
    expires_at: data.expires_at ? data.expires_at.toISOString() : null,
    is_active: data.is_active,
  };
}

export async function createCouponAction(
  _prevState: CouponFormState,
  formData: FormData,
): Promise<CouponFormState> {
  const parsed = couponAdminSchema.safeParse(rawFromForm(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupons")
    .insert(toDbFields(parsed.data))
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/coupons");
  redirect(`/admin/coupons/${data.id}`);
}

export async function updateCouponAction(
  couponId: string,
  _prevState: CouponFormState,
  formData: FormData,
): Promise<CouponFormState> {
  const parsed = couponAdminSchema.safeParse(rawFromForm(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("coupons").update(toDbFields(parsed.data)).eq("id", couponId);

  if (error) return { error: error.message };

  revalidatePath("/admin/coupons");
  revalidatePath(`/admin/coupons/${couponId}`);
  return {};
}

export async function deleteCouponAction(couponId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("coupons").delete().eq("id", couponId);
  if (error) throw error;
  revalidatePath("/admin/coupons");
  redirect("/admin/coupons");
}
