import { createClient } from "@/lib/supabase/server";
import { listProducts, LOW_STOCK_THRESHOLD } from "@/lib/products";
import { listTags } from "@/lib/tags";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const [products, tags] = await Promise.all([listProducts(supabase, {}), listTags(supabase)]);

  const activeCount = products.filter((p) => p.is_active).length;
  const lowStockCount = products.filter((p) => p.stock <= LOW_STOCK_THRESHOLD).length;

  const stats = [
    { label: "Products", value: products.length },
    { label: "Listed", value: activeCount },
    { label: "Low stock", value: lowStockCount },
    { label: "Tags", value: tags.length },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl font-medium text-ink">Dashboard</h1>
      <p className="mt-2 text-ink-2">Catalog, orders, and merchandising tools land here in later phases.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-ui border border-line bg-paper p-5 shadow-ui-sm"
          >
            <p className="font-mono text-xs uppercase tracking-wider text-ink-3">{stat.label}</p>
            <p className="mt-2 font-serif text-3xl font-medium text-ink">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
