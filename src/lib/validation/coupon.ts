import { z } from "zod";

export const couponCodeSchema = z
  .string()
  .trim()
  .min(1, "Enter a coupon code")
  .max(40, "Coupon code is too long");
