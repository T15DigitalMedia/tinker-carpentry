import { z } from "zod";
import { ORDER_STATUSES } from "@/lib/orders";

export const orderUpdateSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  notes: z.string().max(2000, "Notes are too long").optional(),
});
