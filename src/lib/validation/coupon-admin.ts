import { z } from "zod";

function optionalNumber<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((val) => (val === "" || val == null ? undefined : val), schema.optional());
}

// Separate from couponCodeSchema (src/lib/validation/coupon.ts), which only
// validates the code a shopper types at checkout — this is the admin CRUD
// shape, covering every column on the coupons table (see t3's coupons
// migration) that the admin form can set.
const couponAdminObjectSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .max(40, "Code is too long")
    .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers, and dashes only"),
  discount_type: z.enum(["percent", "fixed"]),
  // For "percent" this is a whole percentage (e.g. 10 = 10% off); for
  // "fixed" it's a dollar amount, converted to cents in toDbFields.
  discount_value: z.coerce.number().positive("Discount value must be greater than 0"),
  min_subtotal: z.coerce.number().min(0, "Minimum subtotal can't be negative"),
  usage_limit: optionalNumber(z.coerce.number().int().positive("Usage limit must be greater than 0")),
  expires_at: z.preprocess((val) => (val === "" ? undefined : val), z.coerce.date().optional()),
  is_active: z.boolean(),
});

export const couponAdminSchema = couponAdminObjectSchema.refine(
  (data) => data.discount_type !== "percent" || data.discount_value <= 100,
  { message: "Percent discounts can't exceed 100", path: ["discount_value"] },
);

export type CouponAdminValues = z.infer<typeof couponAdminSchema>;
export type CouponAdminFieldKey = keyof typeof couponAdminObjectSchema.shape;
