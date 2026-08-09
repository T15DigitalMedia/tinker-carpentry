import { z } from "zod";

export const submitReviewSchema = z.object({
  orderRef: z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{8}$/, "Enter the 8-character order reference from your confirmation email"),
  email: z.email("Enter a valid email address"),
  productId: z.uuid(),
  rating: z.coerce.number().int().min(1, "Choose a rating").max(5, "Choose a rating"),
  body: z
    .string()
    .trim()
    .min(10, "Reviews need at least 10 characters")
    .max(2000, "Reviews can't be longer than 2000 characters"),
});

export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;
