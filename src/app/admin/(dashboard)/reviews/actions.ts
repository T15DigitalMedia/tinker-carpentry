"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { updateReviewStatus, respondToReview } from "@/lib/reviews";

export type ReviewActionState = { error?: string } | undefined;

function revalidateReviewPaths(productSlug: string | null) {
  revalidatePath("/admin/reviews");
  if (productSlug) revalidatePath(`/shop/${productSlug}`);
}

export async function approveReviewAction(
  reviewId: string,
  productSlug: string | null,
  _prevState: ReviewActionState,
  _formData: FormData,
): Promise<ReviewActionState> {
  const supabase = await createClient();
  try {
    await updateReviewStatus(supabase, reviewId, "approved");
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to approve review." };
  }
  revalidateReviewPaths(productSlug);
  return {};
}

export async function hideReviewAction(
  reviewId: string,
  productSlug: string | null,
  _prevState: ReviewActionState,
  _formData: FormData,
): Promise<ReviewActionState> {
  const supabase = await createClient();
  try {
    await updateReviewStatus(supabase, reviewId, "hidden");
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to hide review." };
  }
  revalidateReviewPaths(productSlug);
  return {};
}

export async function respondToReviewAction(
  reviewId: string,
  productSlug: string | null,
  _prevState: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const response = String(formData.get("adminResponse") ?? "").trim();
  if (!response) {
    return { error: "Enter a response before saving." };
  }

  const supabase = await createClient();
  try {
    await respondToReview(supabase, reviewId, response);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to save response." };
  }
  revalidateReviewPaths(productSlug);
  return {};
}
