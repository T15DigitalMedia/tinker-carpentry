"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/currency";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from "@/lib/orders";
import { trackOrderAction } from "@/app/track/actions";

const inputClass =
  "w-full rounded-ui border border-line-strong bg-panel px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-focus focus:ring-2 focus:ring-focus/25";
const labelClass = "flex flex-col gap-1.5 text-sm font-medium text-ink-2";

export function TrackOrderForm() {
  const [state, formAction, isPending] = useActionState(trackOrderAction, undefined);

  return (
    <div className="flex flex-col gap-8">
      <form
        action={formAction}
        className="flex flex-col gap-5 rounded-ui border border-line bg-paper p-6 shadow-ui-sm"
      >
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
        </label>
        <label className={labelClass}>
          Email
          <input type="email" name="email" required className={inputClass} />
        </label>
        {state?.error && <p className="text-xs text-red-700">{state.error}</p>}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Looking up..." : "Track order"}
        </Button>
      </form>

      {state?.order && (
        <div className="rounded-ui border border-line bg-paper p-6 shadow-ui-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-ink-3">Order {state.order.orderRef}</p>
              <p className="mt-1 text-sm text-ink-2">
                Placed {new Date(state.order.createdAt).toLocaleDateString("en-CA")}
              </p>
            </div>
            <span
              className={`inline-flex items-center rounded-ui-sm border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${ORDER_STATUS_TONE[state.order.status]}`}
            >
              {ORDER_STATUS_LABELS[state.order.status]}
            </span>
          </div>

          <table className="mt-5 w-full text-left text-sm">
            <tbody>
              {state.order.items.map((item, index) => (
                <tr key={index} className="border-b border-line last:border-none">
                  <td className="py-2 text-ink-2">
                    {item.productName} × {item.quantity}
                  </td>
                  <td className="py-2 text-right text-ink-2">{formatPrice(item.unitPriceCents * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex items-baseline justify-between border-t border-line pt-3">
            <span className="font-mono text-xs uppercase tracking-wider text-ink-2">Total paid</span>
            <span className="text-lg font-medium text-ink">{formatPrice(state.order.totalCents)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
