"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { cancelOrder, getOrder, isValidOrderStatusTransition, shortOrderRef } from "@/lib/orders";
import { orderUpdateSchema } from "@/lib/validation/order";
import { sendOrderStatusUpdateEmail } from "@/lib/order-emails";
import { stripe } from "@/lib/stripe";

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

  if (parsed.data.status !== order.status) {
    await sendOrderStatusUpdateEmail({
      to: order.customer_email,
      orderRef: shortOrderRef(order.id),
      status: parsed.data.status,
    });
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return {};
}

export type OrderActionState = { error?: string; message?: string } | undefined;

// No Stripe call here — cancelling is purely a status + inventory change.
export async function cancelOrderAction(
  orderId: string,
  _prevState: OrderActionState,
  _formData: FormData,
): Promise<OrderActionState> {
  const supabase = await createClient();
  const order = await getOrder(supabase, orderId);

  if (!isValidOrderStatusTransition(order.status, "cancelled")) {
    return { error: `Can't cancel an order in "${order.status}" status.` };
  }

  let result;
  try {
    result = await cancelOrder(supabase, orderId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to cancel order." };
  }

  if (result.transitioned) {
    await sendOrderStatusUpdateEmail({
      to: order.customer_email,
      orderRef: shortOrderRef(order.id),
      status: "cancelled",
    });
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { message: "Order cancelled." };
}

// Only calls Stripe — the order's status flips to "refunded" and stock is
// restocked once Stripe confirms the refund via webhook (see
// src/app/api/webhooks/stripe/route.ts), not here. That way a refund
// issued directly from the Stripe dashboard is also picked up correctly.
export async function refundOrderAction(
  orderId: string,
  _prevState: OrderActionState,
  _formData: FormData,
): Promise<OrderActionState> {
  const supabase = await createClient();
  const order = await getOrder(supabase, orderId);

  if (!isValidOrderStatusTransition(order.status, "refunded")) {
    return { error: `Can't refund an order in "${order.status}" status.` };
  }
  if (!order.stripe_payment_intent_id) {
    return { error: "This order has no associated payment to refund." };
  }

  try {
    await stripe.refunds.create({ payment_intent: order.stripe_payment_intent_id });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Refund failed." };
  }

  revalidatePath(`/admin/orders/${orderId}`);
  return { message: "Refund initiated — the order will update once Stripe confirms it." };
}
