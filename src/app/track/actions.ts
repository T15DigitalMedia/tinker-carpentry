"use server";

import { createClient } from "@/lib/supabase/server";
import { trackOrder, type TrackedOrder } from "@/lib/orders";
import { trackOrderSchema } from "@/lib/validation/order-tracking";

export type TrackOrderState = {
  error?: string;
  order?: TrackedOrder;
} | undefined;

export async function trackOrderAction(
  _prevState: TrackOrderState,
  formData: FormData,
): Promise<TrackOrderState> {
  const parsed = trackOrderSchema.safeParse({
    orderRef: formData.get("orderRef"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: "Enter a valid order reference and email." };
  }

  const supabase = await createClient();
  const order = await trackOrder(supabase, parsed.data);

  if (!order) {
    return { error: "We couldn't find an order matching that reference and email." };
  }

  return { order };
}
