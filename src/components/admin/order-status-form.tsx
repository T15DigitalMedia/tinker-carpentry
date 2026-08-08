"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { nextOrderStatuses, ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/orders";
import type { OrderUpdateState } from "@/app/admin/(dashboard)/orders/actions";

const inputClass =
  "w-full rounded-ui border border-line-strong bg-panel px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-focus focus:ring-2 focus:ring-focus/25";
const labelClass = "flex flex-col gap-1.5 text-sm font-medium text-ink-2";
const errorClass = "text-xs text-red-700";

export function OrderStatusForm({
  action,
  status,
  notes,
}: {
  action: (prevState: OrderUpdateState, formData: FormData) => Promise<OrderUpdateState>;
  status: OrderStatus;
  notes: string | null;
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);
  const fieldErrors = state?.fieldErrors ?? {};
  const options = [status, ...nextOrderStatuses(status)];

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-5 rounded-ui border border-line bg-paper p-6 shadow-ui-sm">
      {state?.error && <p className={errorClass}>{state.error}</p>}

      <label className={labelClass}>
        Status
        <select name="status" defaultValue={status} className={inputClass}>
          {options.map((option) => (
            <option key={option} value={option}>
              {ORDER_STATUS_LABELS[option]}
            </option>
          ))}
        </select>
        {fieldErrors.status && <span className={errorClass}>{fieldErrors.status[0]}</span>}
      </label>

      <label className={labelClass}>
        Notes
        <textarea name="notes" rows={4} defaultValue={notes ?? ""} className={inputClass} />
        {fieldErrors.notes && <span className={errorClass}>{fieldErrors.notes[0]}</span>}
      </label>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
