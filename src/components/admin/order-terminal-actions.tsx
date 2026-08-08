"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { nextOrderStatuses, type OrderStatus } from "@/lib/orders";
import type { OrderActionState } from "@/app/admin/(dashboard)/orders/actions";

type TerminalAction = (prevState: OrderActionState, formData: FormData) => Promise<OrderActionState>;

function TerminalActionButton({
  action,
  label,
  pendingLabel,
  confirmMessage,
}: {
  action: TerminalAction;
  label: string;
  pendingLabel: string;
  confirmMessage: string;
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
      className="flex flex-col gap-2"
    >
      <Button type="submit" variant="secondary" disabled={isPending}>
        {isPending ? pendingLabel : label}
      </Button>
      {state?.error && <p className="text-xs text-red-700">{state.error}</p>}
      {state?.message && <p className="text-xs text-ok">{state.message}</p>}
    </form>
  );
}

export function OrderTerminalActions({
  status,
  cancelAction,
  refundAction,
}: {
  status: OrderStatus;
  cancelAction: TerminalAction;
  refundAction: TerminalAction;
}) {
  const available = nextOrderStatuses(status);
  const canCancel = available.includes("cancelled");
  const canRefund = available.includes("refunded");

  if (!canCancel && !canRefund) return null;

  return (
    <div className="mt-4 rounded-ui border border-line bg-paper p-6 shadow-ui-sm">
      <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-ink-3">Other actions</h2>
      <div className="flex flex-wrap gap-3">
        {canCancel && (
          <TerminalActionButton
            action={cancelAction}
            label="Cancel order"
            pendingLabel="Cancelling…"
            confirmMessage="Cancel this order and return the items to stock?"
          />
        )}
        {canRefund && (
          <TerminalActionButton
            action={refundAction}
            label="Refund order"
            pendingLabel="Refunding…"
            confirmMessage="Refund this order via Stripe? This returns the payment to the customer."
          />
        )}
      </div>
    </div>
  );
}
