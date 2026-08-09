import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import type { SubmitReviewInput } from "@/lib/validation/review";
import { shortOrderRef } from "@/lib/orders";

export type ReviewStatus = Database["public"]["Tables"]["reviews"]["Row"]["status"];
export type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];

export type SubmitReviewResult = { ok: true } | { ok: false; error: string };

// submit_review (t5-1 migration) raises a plain exception with a
// user-facing message for every rejection (no matching order, wrong
// product, already reviewed, ineligible order) — same shape as
// cancel_order_and_restock, so the error is just relayed as-is.
export async function submitReview(
  supabase: SupabaseClient<Database>,
  input: SubmitReviewInput,
): Promise<SubmitReviewResult> {
  const { error } = await supabase.rpc("submit_review", {
    p_order_ref: input.orderRef,
    p_email: input.email,
    p_product_id: input.productId,
    p_rating: input.rating,
    p_body: input.body,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function listApprovedReviews(supabase: SupabaseClient<Database>, productId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export type ReviewAggregate = { count: number; average: number | null };

export function reviewAggregate(reviews: { rating: number }[]): ReviewAggregate {
  if (reviews.length === 0) return { count: 0, average: null };
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return { count: reviews.length, average: sum / reviews.length };
}

export type ModerationReview = ReviewRow & {
  productName: string;
  productSlug: string | null;
  orderRef: string;
};

export async function listReviewsForModeration(
  supabase: SupabaseClient<Database>,
  { status }: { status?: ReviewStatus } = {},
): Promise<ModerationReview[]> {
  let query = supabase.from("reviews").select("*").order("created_at", { ascending: false });
  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  if (data.length === 0) return [];

  const productIds = [...new Set(data.map((review) => review.product_id))];
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, slug")
    .in("id", productIds);
  if (productsError) throw productsError;
  const productsById = new Map(products.map((product) => [product.id, product]));

  return data.map((review) => {
    const product = productsById.get(review.product_id);
    return {
      ...review,
      productName: product?.name ?? "Deleted product",
      productSlug: product?.slug ?? null,
      orderRef: shortOrderRef(review.order_id),
    };
  });
}

export async function updateReviewStatus(supabase: SupabaseClient<Database>, id: string, status: ReviewStatus) {
  const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function respondToReview(supabase: SupabaseClient<Database>, id: string, adminResponse: string) {
  const { error } = await supabase.from("reviews").update({ admin_response: adminResponse }).eq("id", id);
  if (error) throw error;
}
