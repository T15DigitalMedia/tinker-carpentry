"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { SubmitReviewState } from "@/app/shop/[slug]/actions";

const inputClass =
  "w-full rounded-ui border border-line-strong bg-panel px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-focus focus:ring-2 focus:ring-focus/25";
const labelClass = "flex flex-col gap-1.5 text-sm font-medium text-ink-2";
const errorClass = "text-xs text-red-700";

const RATING_OPTIONS = [
  { value: 5, label: "★★★★★ (5 — excellent)" },
  { value: 4, label: "★★★★☆ (4 — good)" },
  { value: 3, label: "★★★☆☆ (3 — okay)" },
  { value: 2, label: "★★☆☆ (2 — not great)" },
  { value: 1, label: "★☆☆☆☆ (1 — poor)" },
];

export function ReviewForm({
  action,
}: {
  action: (prevState: SubmitReviewState, formData: FormData) => Promise<SubmitReviewState>;
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);
  const fieldErrors = state?.fieldErrors ?? {};

  if (state?.success) {
    return (
      <p className="rounded-ui border border-ok/40 bg-ok/10 p-4 text-sm text-ok">
        Thanks — your review has been submitted and is pending approval.
      </p>
    );
  }

  return (
    <form
      action={formAction}
      className="flex max-w-lg flex-col gap-5 rounded-ui border border-line bg-paper p-6 shadow-ui-sm"
    >
      {state?.error && <p className={errorClass}>{state.error}</p>}

      <p className="text-sm text-ink-2">
        Enter the order reference and email from your confirmation email to leave a review for this product.
      </p>

      <div className="grid grid-cols-2 gap-5">
        <label className={labelClass}>
          Order reference
          <input
            type="text"
            name="orderRef"
            required
            placeholder="A1B2C3D4"
            maxLength={8}
            className={`${inputClass} uppercase`}
          />
          {fieldErrors.orderRef && <span className={errorClass}>{fieldErrors.orderRef[0]}</span>}
        </label>
        <label className={labelClass}>
          Email
          <input type="email" name="email" required className={inputClass} />
          {fieldErrors.email && <span className={errorClass}>{fieldErrors.email[0]}</span>}
        </label>
      </div>

      <label className={labelClass}>
        Rating
        <select name="rating" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Choose a rating
          </option>
          {RATING_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {fieldErrors.rating && <span className={errorClass}>{fieldErrors.rating[0]}</span>}
      </label>

      <label className={labelClass}>
        Review
        <textarea name="body" rows={4} required minLength={10} maxLength={2000} className={inputClass} />
        {fieldErrors.body && <span className={errorClass}>{fieldErrors.body[0]}</span>}
      </label>

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Submitting..." : "Submit review"}
      </Button>
    </form>
  );
}
