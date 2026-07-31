import { z } from "zod";

function optionalNumber<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((val) => (val === "" || val == null ? undefined : val), schema.optional());
}

export const productSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and dashes only"),
  name: z.string().min(1, "Name is required"),
  description: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().optional(),
  ),
  price: z.coerce.number().positive("Price must be greater than 0"),
  stock: z.coerce.number().int().min(0, "Stock can't be negative"),
  is_active: z.boolean(),
  sale_price: optionalNumber(z.coerce.number().positive("Sale price must be greater than 0")),
  made_to_order: z.boolean(),
  lead_time_days: optionalNumber(z.coerce.number().int().min(0)),
  weight_g: optionalNumber(z.coerce.number().int().min(0)),
});

export type ProductFormValues = z.infer<typeof productSchema>;
