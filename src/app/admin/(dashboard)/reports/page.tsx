import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  listOrders,
  ordersInRange,
  summarizeSales,
  shortOrderRef,
  ORDER_STAT_RANGES,
  ORDER_STAT_RANGE_LABELS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONE,
  type OrderStatRange,
} from "@/lib/orders";
import { formatPrice } from "@/lib/currency";

const DEFAULT_RANGE: OrderStatRange = "month";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const activeRange = ORDER_STAT_RANGES.includes(range as OrderStatRange) ? (range as OrderStatRange) : DEFAULT_RANGE;

  const supabase = await createClient();
  const orders = await listOrders(supabase);
  const ordersForRange = ordersInRange(orders, activeRange, new Date());
  const summary = summarizeSales(ordersForRange);

  const stats = [
    { label: "Orders", value: summary.orderCount.toString() },
    { label: "Gross revenue", value: formatPrice(summary.grossRevenueCents) },
    { label: "Average order", value: formatPrice(summary.averageOrderValueCents) },
    { label: "Refunded", value: formatPrice(summary.refundedCents) },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-medium text-ink">Reports</h1>
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-wider text-ink-3">
          {ORDER_STAT_RANGES.map((r) => (
            <Link
              key={r}
              href={`/admin/reports?range=${r}`}
              className={activeRange === r ? "text-walnut" : "hover:text-ink"}
            >
              {ORDER_STAT_RANGE_LABELS[r]}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-ui border border-line bg-paper p-5 shadow-ui-sm">
            <p className="font-mono text-xs uppercase tracking-wider text-ink-3">{stat.label}</p>
            <p className="mt-2 font-serif text-3xl font-medium text-ink">{stat.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 mb-3 font-mono text-xs uppercase tracking-wider text-ink-3">
        Records — {ORDER_STAT_RANGE_LABELS[activeRange].toLowerCase()}
      </h2>
      <div className="overflow-hidden rounded-ui border border-line bg-paper shadow-ui-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-panel font-mono text-xs uppercase tracking-wider text-ink-3">
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Order</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {ordersForRange.map((order) => (
              <tr key={order.id} className="border-b border-line last:border-none hover:bg-panel/60">
                <td className="px-5 py-3 text-ink-2">{new Date(order.created_at).toLocaleDateString("en-CA")}</td>
                <td className="px-5 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="text-ink hover:text-walnut">
                    {shortOrderRef(order.id)}
                  </Link>
                </td>
                <td className="px-5 py-3 text-ink-2">{order.customer_email}</td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex items-center rounded-ui-sm border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${ORDER_STATUS_TONE[order.status]}`}
                  >
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-ink-2">{formatPrice(order.total)}</td>
              </tr>
            ))}
            {ordersForRange.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-ink-3">
                  No orders in this range.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
