"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { submitReview } from "@/lib/reviews";
import { submitReviewSchema } from "@/lib/validation/review";

export type SubmitReviewState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof typeof submitReviewSchema.shape, string[]>>;
  success?: boolean;
} | undefined;

export async function submitReviewAction(
  productId: string,
  productSlug: string,
  _prevState: SubmitReviewState,
  formData: FormData,
): Promise<SubmitReviewState> {
  const parsed = submitReviewSchema.safeParse({
    orderRef: formData.get("orderRef"),
    email: formData.get("email"),
    productId,
    rating: formData.get("rating"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const result = await submitReview(supabase, parsed.data);
  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath(`/shop/${productSlug}`);
  return { success: true };
}
