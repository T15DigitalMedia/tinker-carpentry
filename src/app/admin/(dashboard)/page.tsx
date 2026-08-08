import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listProducts, LOW_STOCK_THRESHOLD } from "@/lib/products";
import { listTags } from "@/lib/tags";
import {
  countOrdersByStatus,
  listOrders,
  ordersInRange,
  ORDER_STAT_RANGES,
  ORDER_STAT_RANGE_LABELS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONE,
  type OrderStatRange,
  type OrderStatus,
} from "@/lib/orders";

const DEFAULT_RANGE: OrderStatRange = "today";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const activeRange = ORDER_STAT_RANGES.includes(range as OrderStatRange) ? (range as OrderStatRange) : DEFAULT_RANGE;

  const supabase = await createClient();
  const [products, tags, orders] = await Promise.all([
    listProducts(supabase, {}),
    listTags(supabase),
    listOrders(supabase),
  ]);

  const activeCount = products.filter((p) => p.is_active).length;
  const lowStockCount = products.filter((p) => p.stock <= LOW_STOCK_THRESHOLD).length;

  const catalogStats = [
    { label: "Products", value: products.length },
    { label: "Listed", value: activeCount },
    { label: "Low stock", value: lowStockCount },
    { label: "Tags", value: tags.length },
  ];

  const ordersForRange = ordersInRange(orders, activeRange, new Date());
  const statusCounts = countOrdersByStatus(ordersForRange);

  return (
    <div>
      <h1 className="font-serif text-3xl font-medium text-ink">Dashboard</h1>
      <p className="mt-2 text-ink-2">Catalog, orders, and merchandising tools land here in later phases.</p>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-mono text-xs uppercase tracking-wider text-ink-3">Orders</h2>
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-wider text-ink-3">
          {ORDER_STAT_RANGES.map((r) => (
            <Link
              key={r}
              href={`/admin?range=${r}`}
              className={activeRange === r ? "text-walnut" : "hover:text-ink"}
            >
              {ORDER_STAT_RANGE_LABELS[r]}
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-ui border border-line bg-paper p-5 shadow-ui-sm">
          <p className="font-mono text-xs uppercase tracking-wider text-ink-3">Total</p>
          <p className="mt-2 font-serif text-3xl font-medium text-ink">{ordersForRange.length}</p>
        </div>
        {(Object.keys(statusCounts) as OrderStatus[]).map((status) => (
          <div key={status} className={`rounded-ui border p-5 shadow-ui-sm ${ORDER_STATUS_TONE[status]}`}>
            <p className="font-mono text-xs uppercase tracking-wider opacity-80">{ORDER_STATUS_LABELS[status]}</p>
            <p className="mt-2 font-serif text-3xl font-medium">{statusCounts[status]}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-mono text-xs uppercase tracking-wider text-ink-3">Catalog</h2>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {catalogStats.map((stat) => (
          <div key={stat.label} className="rounded-ui border border-line bg-paper p-5 shadow-ui-sm">
            <p className="font-mono text-xs uppercase tracking-wider text-ink-3">{stat.label}</p>
            <p className="mt-2 font-serif text-3xl font-medium text-ink">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
