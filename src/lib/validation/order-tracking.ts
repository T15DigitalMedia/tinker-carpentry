import { z } from "zod";

export const trackOrderSchema = z.object({
  orderRef: z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{8}$/, "Enter the 8-character order reference from your confirmation email"),
  email: z.email("Enter a valid email address"),
});
