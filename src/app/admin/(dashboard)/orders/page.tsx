import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listOrders, ORDER_STATUSES, ORDER_STATUS_LABELS, shortOrderRef, type OrderStatus } from "@/lib/orders";
import { formatPrice } from "@/lib/currency";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = ORDER_STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : undefined;

  const supabase = await createClient();
  const orders = await listOrders(supabase, { status: activeStatus });

  return (
    <div>
      <h1 className="font-serif text-3xl font-medium text-ink">Orders</h1>

      <div className="mt-6 flex items-center gap-3 font-mono text-xs uppercase tracking-wider text-ink-3">
        Status:
        <Link href="/admin/orders" className={!activeStatus ? "text-walnut" : "hover:text-ink"}>
          All
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={activeStatus === s ? "text-walnut" : "hover:text-ink"}
          >
            {ORDER_STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-ui border border-line bg-paper shadow-ui-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-panel font-mono text-xs uppercase tracking-wider text-ink-3">
              <th className="px-5 py-3">Order</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-line last:border-none hover:bg-panel/60">
                <td className="px-5 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="text-ink hover:text-walnut">
                    {shortOrderRef(order.id)}
                  </Link>
                </td>
                <td className="px-5 py-3 text-ink-2">
                  {new Date(order.created_at).toLocaleDateString("en-CA")}
                </td>
                <td className="px-5 py-3 text-ink-2">{order.customer_email}</td>
                <td className="px-5 py-3 text-ink-2">{formatPrice(order.total)}</td>
                <td className="px-5 py-3 text-ink-2">{ORDER_STATUS_LABELS[order.status]}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-ink-3">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
