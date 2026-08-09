"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { CouponFormState } from "@/app/admin/(dashboard)/coupons/actions";

type CouponFormValues = {
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_subtotal: number;
  usage_limit: number | null;
  times_used: number;
  is_active: boolean;
  expires_at: string | null;
};

function centsToDollarsInput(cents: number | null | undefined) {
  return cents == null ? "" : (cents / 100).toFixed(2);
}

const inputClass =
  "w-full rounded-ui border border-line-strong bg-panel px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-focus focus:ring-2 focus:ring-focus/25";
const labelClass = "flex flex-col gap-1.5 text-sm font-medium text-ink-2";
const errorClass = "text-xs text-red-700";
const checkboxClass = "h-4 w-4 accent-walnut";

export function CouponForm({
  action,
  coupon,
  submitLabel,
}: {
  action: (prevState: CouponFormState, formData: FormData) => Promise<CouponFormState>;
  coupon?: CouponFormValues;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);
  const fieldErrors = state?.fieldErrors ?? {};

  return (
    <form
      action={formAction}
      className="flex max-w-2xl flex-col gap-5 rounded-ui border border-line bg-paper p-6 shadow-ui-sm"
    >
      {state?.error && <p className={errorClass}>{state.error}</p>}

      <label className={labelClass}>
        Code
        <input
          type="text"
          name="code"
          required
          defaultValue={coupon?.code}
          placeholder="SAVE10"
          className={`${inputClass} uppercase`}
        />
        {fieldErrors.code && <span className={errorClass}>{fieldErrors.code[0]}</span>}
      </label>

      <div className="grid grid-cols-2 gap-5">
        <label className={labelClass}>
          Discount type
          <select name="discount_type" defaultValue={coupon?.discount_type ?? "percent"} className={inputClass}>
            <option value="percent">Percent off</option>
            <option value="fixed">Fixed amount off</option>
          </select>
          {fieldErrors.discount_type && <span className={errorClass}>{fieldErrors.discount_type[0]}</span>}
        </label>
        <label className={labelClass}>
          Discount value
          <input
            type="number"
            name="discount_value"
            required
            step="0.01"
            min="0"
            defaultValue={
              coupon
                ? coupon.discount_type === "fixed"
                  ? centsToDollarsInput(coupon.discount_value)
                  : coupon.discount_value
                : undefined
            }
            className={inputClass}
          />
          <span className="text-xs text-ink-3">Whole percent (e.g. 10) or a CAD amount, depending on type.</span>
          {fieldErrors.discount_value && <span className={errorClass}>{fieldErrors.discount_value[0]}</span>}
        </label>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <label className={labelClass}>
          Minimum subtotal (CAD)
          <input
            type="number"
            name="min_subtotal"
            step="0.01"
            min="0"
            defaultValue={centsToDollarsInput(coupon?.min_subtotal ?? 0)}
            className={inputClass}
          />
          {fieldErrors.min_subtotal && <span className={errorClass}>{fieldErrors.min_subtotal[0]}</span>}
        </label>
        <label className={labelClass}>
          Usage limit (optional)
          <input
            type="number"
            name="usage_limit"
            min="1"
            step="1"
            defaultValue={coupon?.usage_limit ?? ""}
            className={inputClass}
          />
          {fieldErrors.usage_limit && <span className={errorClass}>{fieldErrors.usage_limit[0]}</span>}
        </label>
      </div>

      <label className={labelClass}>
        Expires (optional)
        <input
          type="date"
          name="expires_at"
          defaultValue={coupon?.expires_at ? coupon.expires_at.slice(0, 10) : ""}
          className={inputClass}
        />
        {fieldErrors.expires_at && <span className={errorClass}>{fieldErrors.expires_at[0]}</span>}
      </label>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" name="is_active" defaultChecked={coupon?.is_active ?? true} className={checkboxClass} />
        Active
      </label>

      {coupon && (
        <p className="text-xs text-ink-3">
          Used {coupon.times_used} time{coupon.times_used === 1 ? "" : "s"}
          {coupon.usage_limit != null && ` of ${coupon.usage_limit}`}.
        </p>
      )}

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
