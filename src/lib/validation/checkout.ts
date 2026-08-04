import { z } from "zod";
import { couponCodeSchema } from "@/lib/validation/coupon";

export const checkoutInputSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "Your cart is empty"),
  couponCode: couponCodeSchema.optional(),
});

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;
