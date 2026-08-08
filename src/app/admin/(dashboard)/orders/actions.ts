"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrder, isValidOrderStatusTransition } from "@/lib/orders";
import { orderUpdateSchema } from "@/lib/validation/order";

export type OrderUpdateState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof typeof orderUpdateSchema.shape, string[]>>;
} | undefined;

export async function updateOrderAction(
  orderId: string,
  _prevState: OrderUpdateState,
  formData: FormData,
): Promise<OrderUpdateState> {
  const parsed = orderUpdateSchema.safeParse({
    status: formData.get("status"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const order = await getOrder(supabase, orderId);

  if (!isValidOrderStatusTransition(order.status, parsed.data.status)) {
    return { error: `Can't move an order from "${order.status}" to "${parsed.data.status}".` };
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: parsed.data.status, notes: parsed.data.notes ?? null })
    .eq("id", orderId);

  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return {};
}
