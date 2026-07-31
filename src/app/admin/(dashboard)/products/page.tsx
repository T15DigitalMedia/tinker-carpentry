import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listProducts, LOW_STOCK_THRESHOLD, type ProductSort } from "@/lib/products";
import { Button } from "@/components/ui/button";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const { q, sort } = await searchParams;
  const supabase = await createClient();
  const products = await listProducts(supabase, {
    search: q,
    sort: sort as ProductSort | undefined,
  });

  const sortLinks: { label: string; value: ProductSort }[] = [
    { label: "Name", value: "name" },
    { label: "Price", value: "price" },
    { label: "Stock", value: "stock" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium text-ink">Products</h1>
        <Link href="/admin/products/new">
          <Button>New product</Button>
        </Link>
      </div>

      <form className="mt-6 flex items-center gap-4" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by name..."
          className="rounded-ui border border-line-strong bg-panel px-3 py-2 text-sm text-ink"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-wider text-ink-3">
          Sort:
          {sortLinks.map((s) => (
            <Link
              key={s.value}
              href={`/admin/products?${q ? `q=${encodeURIComponent(q)}&` : ""}sort=${s.value}`}
              className={sort === s.value || (!sort && s.value === "name") ? "text-walnut" : "hover:text-ink"}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </form>

      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line-strong font-mono text-xs uppercase tracking-wider text-ink-3">
            <th className="pb-2">Name</th>
            <th className="pb-2">Price</th>
            <th className="pb-2">Stock</th>
            <th className="pb-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-line">
              <td className="py-3">
                <Link href={`/admin/products/${product.id}`} className="text-ink hover:text-walnut">
                  {product.name}
                </Link>
              </td>
              <td className="py-3 text-ink-2">
                {formatPrice(product.sale_price ?? product.price)}
                {product.sale_price != null && (
                  <span className="ml-2 text-ink-3 line-through">{formatPrice(product.price)}</span>
                )}
              </td>
              <td className="py-3">
                <span className={product.stock <= LOW_STOCK_THRESHOLD ? "font-medium text-open" : "text-ink-2"}>
                  {product.stock}
                  {product.stock <= LOW_STOCK_THRESHOLD && " (low)"}
                </span>
              </td>
              <td className="py-3 text-ink-2">{product.is_active ? "Active" : "Hidden"}</td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={4} className="py-6 text-center text-ink-3">
                No products yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
