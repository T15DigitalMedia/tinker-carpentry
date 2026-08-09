"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import type { ModerationReview } from "@/lib/reviews";
import type { ReviewActionState } from "@/app/admin/(dashboard)/reviews/actions";

type BoundAction = (prevState: ReviewActionState, formData: FormData) => Promise<ReviewActionState>;

const STATUS_TONE: Record<ModerationReview["status"], string> = {
  pending: "border-open/40 bg-open/10 text-open",
  approved: "border-ok/40 bg-ok/10 text-ok",
  hidden: "border-line-strong bg-panel text-ink-3",
};

function stars(rating: number) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

export function ReviewRow({
  review,
  approveAction,
  hideAction,
  respondAction,
}: {
  review: ModerationReview;
  approveAction: BoundAction;
  hideAction: BoundAction;
  respondAction: BoundAction;
}) {
  const [approveState, approveFormAction, isApproving] = useActionState(approveAction, undefined);
  const [hideState, hideFormAction, isHiding] = useActionState(hideAction, undefined);
  const [respondState, respondFormAction, isResponding] = useActionState(respondAction, undefined);
  const [showRespond, setShowRespond] = useState(false);

  return (
    <li className="rounded-ui border border-line bg-paper p-5 shadow-ui-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium text-ink">{review.productName}</p>
          <p className="text-xs text-ink-3">
            Order {review.orderRef} · {review.reviewer_email} ·{" "}
            {new Date(review.created_at).toLocaleDateString("en-CA")}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-ui-sm border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${STATUS_TONE[review.status]}`}
        >
          {review.status}
        </span>
      </div>

      <p className="mt-3 font-mono text-sm text-walnut">{stars(review.rating)}</p>
      <p className="mt-2 leading-relaxed text-ink-2">{review.body}</p>

      {review.admin_response && (
        <div className="mt-4 rounded-ui-sm border-l-2 border-walnut bg-panel p-3 text-sm text-ink-2">
          <p className="font-mono text-[10px] uppercase tracking-wider text-walnut">Your response</p>
          <p className="mt-1">{review.admin_response}</p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {review.status !== "approved" && (
          <form action={approveFormAction}>
            <Button type="submit" variant="secondary" disabled={isApproving}>
              {isApproving ? "Approving..." : "Approve"}
            </Button>
          </form>
        )}
        {review.status !== "hidden" && (
          <form action={hideFormAction}>
            <Button type="submit" variant="secondary" disabled={isHiding}>
              {isHiding ? "Hiding..." : "Hide"}
            </Button>
          </form>
        )}
        <Button type="button" variant="secondary" onClick={() => setShowRespond((v) => !v)}>
          {review.admin_response ? "Edit response" : "Respond"}
        </Button>
      </div>

      {approveState?.error && <p className="mt-2 text-xs text-red-700">{approveState.error}</p>}
      {hideState?.error && <p className="mt-2 text-xs text-red-700">{hideState.error}</p>}

      {showRespond && (
        <form action={respondFormAction} className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
          <textarea
            name="adminResponse"
            rows={3}
            defaultValue={review.admin_response ?? ""}
            placeholder="Write a response to this review..."
            className="w-full rounded-ui border border-line-strong bg-panel px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-focus focus:ring-2 focus:ring-focus/25"
          />
          {respondState?.error && <p className="text-xs text-red-700">{respondState.error}</p>}
          <Button type="submit" variant="secondary" disabled={isResponding} className="self-start">
            {isResponding ? "Saving..." : "Save response"}
          </Button>
        </form>
      )}
    </li>
  );
}
