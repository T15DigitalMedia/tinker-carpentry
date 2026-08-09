"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SaleActionState = { error?: string; message?: string } | undefined;

function revalidateShopPaths() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/shop/[slug]", "page");
}

export async function applyBulkSaleAction(
  _prevState: SaleActionState,
  formData: FormData,
): Promise<SaleActionState> {
  const discountPercent = Number(formData.get("discountPercent"));
  const tagId = String(formData.get("tagId") ?? "").trim() || null;
  const expiresAtRaw = String(formData.get("expiresAt") ?? "").trim();

  if (!Number.isInteger(discountPercent) || discountPercent < 1 || discountPercent > 100) {
    return { error: "Enter a whole percent between 1 and 100." };
  }

  // Interpreted as end-of-day local time so "expires Aug 20" still honors
  // the sale through Aug 20, not from midnight that morning.
  const expiresAt = expiresAtRaw ? new Date(`${expiresAtRaw}T23:59:59`).toISOString() : null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("apply_bulk_sale", {
    p_discount_percent: discountPercent,
    p_tag_id: tagId,
    p_expires_at: expiresAt,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/sales");
  revalidateShopPaths();
  return { message: `Applied to ${data} product${data === 1 ? "" : "s"}.` };
}

export async function clearBulkSaleAction(
  _prevState: SaleActionState,
  formData: FormData,
): Promise<SaleActionState> {
  const tagId = String(formData.get("tagId") ?? "").trim() || null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("clear_bulk_sale", { p_tag_id: tagId });

  if (error) return { error: error.message };

  revalidatePath("/admin/sales");
  revalidateShopPaths();
  return { message: `Cleared sale pricing on ${data} product${data === 1 ? "" : "s"}.` };
}
