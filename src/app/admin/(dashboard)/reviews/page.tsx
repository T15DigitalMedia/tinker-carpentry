import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listReviewsForModeration, type ReviewStatus } from "@/lib/reviews";
import { approveReviewAction, hideReviewAction, respondToReviewAction } from "./actions";
import { ReviewRow } from "@/components/admin/review-row";

const STATUS_TABS: { label: string; value: ReviewStatus | "all" }[] = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Hidden", value: "hidden" },
  { label: "All", value: "all" },
];

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = STATUS_TABS.some((tab) => tab.value === status) ? (status as ReviewStatus | "all") : "pending";

  const supabase = await createClient();
  const reviews = await listReviewsForModeration(supabase, {
    status: activeStatus === "all" ? undefined : activeStatus,
  });

  return (
    <div>
      <h1 className="font-serif text-3xl font-medium text-ink">Reviews</h1>

      <div className="mt-6 flex items-center gap-4 font-mono text-xs uppercase tracking-wider text-ink-3">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/reviews?status=${tab.value}`}
            className={activeStatus === tab.value ? "text-walnut" : "hover:text-ink"}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <ul className="mt-6 flex flex-col gap-4">
        {reviews.map((review) => (
          <ReviewRow
            key={review.id}
            review={review}
            approveAction={approveReviewAction.bind(null, review.id, review.productSlug)}
            hideAction={hideReviewAction.bind(null, review.id, review.productSlug)}
            respondAction={respondToReviewAction.bind(null, review.id, review.productSlug)}
          />
        ))}
        {reviews.length === 0 && (
          <li className="rounded-ui border border-line bg-paper p-8 text-center text-ink-3 shadow-ui-sm">
            No reviews here.
          </li>
        )}
      </ul>
    </div>
  );
}
