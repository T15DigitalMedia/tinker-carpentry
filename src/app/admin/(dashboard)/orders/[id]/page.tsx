import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrder, getOrderItems, ORDER_STATUS_LABELS, shortOrderRef } from "@/lib/orders";
import { formatPrice } from "@/lib/currency";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { OrderTerminalActions } from "@/components/admin/order-terminal-actions";
import { cancelOrderAction, refundOrderAction, updateOrderAction } from "../actions";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  let order;
  try {
    order = await getOrder(supabase, id);
  } catch {
    notFound();
  }

  const items = await getOrderItems(supabase, id);
  const boundUpdate = updateOrderAction.bind(null, id);
  const boundCancel = cancelOrderAction.bind(null, id);
  const boundRefund = refundOrderAction.bind(null, id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-medium text-ink">Order {shortOrderRef(order.id)}</h1>
        <span className="font-mono text-xs uppercase tracking-wider text-ink-3">
          {new Date(order.created_at).toLocaleString("en-CA")}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
          <div className="rounded-ui border border-line bg-paper p-6 shadow-ui-sm">
            <h2 className="font-serif text-xl font-medium text-ink">Customer</h2>
            <dl className="mt-3 flex flex-col gap-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-3">Email</dt>
                <dd className="text-ink-2">{order.customer_email}</dd>
              </div>
              {order.customer_phone && (
                <div className="flex justify-between">
                  <dt className="text-ink-3">Phone</dt>
                  <dd className="text-ink-2">{order.customer_phone}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-ui border border-line bg-paper p-6 shadow-ui-sm">
            <h2 className="font-serif text-xl font-medium text-ink">Items</h2>
            <table className="mt-3 w-full text-left text-sm">
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-line last:border-none">
                    <td className="py-2 text-ink-2">
                      {item.product_name} × {item.quantity}
                    </td>
                    <td className="py-2 text-right text-ink-2">{formatPrice(item.unit_price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <dl className="mt-4 flex flex-col gap-1 border-t border-line pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-3">Subtotal</dt>
                <dd className="text-ink-2">{formatPrice(order.subtotal)}</dd>
              </div>
              {order.discount_cents > 0 && (
                <div className="flex justify-between">
                  <dt className="text-ink-3">Discount{order.coupon_code ? ` (${order.coupon_code})` : ""}</dt>
                  <dd className="text-ink-2">-{formatPrice(order.discount_cents)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink-3">Tax</dt>
                <dd className="text-ink-2">{formatPrice(order.tax_cents)}</dd>
              </div>
              <div className="flex justify-between font-medium">
                <dt className="text-ink">Total</dt>
                <dd className="text-ink">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div>
          <h2 className="mb-3 font-serif text-xl font-medium text-ink">
            Status: <span className="text-walnut">{ORDER_STATUS_LABELS[order.status]}</span>
          </h2>
          <OrderStatusForm action={boundUpdate} status={order.status} notes={order.notes} />
          <OrderTerminalActions status={order.status} cancelAction={boundCancel} refundAction={boundRefund} />
        </div>
      </div>
    </div>
  );
}
