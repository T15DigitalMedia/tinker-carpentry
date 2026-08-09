import { createClient } from "@/lib/supabase/server";
import { listProductsOnSale } from "@/lib/products";
import { listTags } from "@/lib/tags";
import { formatPrice } from "@/lib/currency";
import { SalesTools } from "@/components/admin/sales-tools";
import { applyBulkSaleAction, clearBulkSaleAction } from "./actions";

export default async function AdminSalesPage() {
  const supabase = await createClient();
  const [tags, onSale] = await Promise.all([listTags(supabase), listProductsOnSale(supabase)]);

  return (
    <div>
      <h1 className="font-serif text-3xl font-medium text-ink">Sales</h1>
      <p className="mt-2 max-w-2xl text-ink-2">
        Apply a discount across every active product, or scope it to a tag. This writes directly onto each
        product&rsquo;s sale price — the same field the product form sets individually — so it shows up on the
        storefront and at checkout with no other changes.
      </p>

      <div className="mt-6">
        <SalesTools
          tags={tags}
          applyAction={applyBulkSaleAction}
          clearAction={clearBulkSaleAction}
        />
      </div>

      <h2 className="mt-10 mb-3 font-mono text-xs uppercase tracking-wider text-ink-3">
        Currently on sale ({onSale.length})
      </h2>
      <div className="overflow-hidden rounded-ui border border-line bg-paper shadow-ui-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-panel font-mono text-xs uppercase tracking-wider text-ink-3">
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Sale price</th>
              <th className="px-5 py-3">Ends</th>
            </tr>
          </thead>
          <tbody>
            {onSale.map((product) => {
              const expired = product.sale_expires_at != null && new Date(product.sale_expires_at) <= new Date();
              return (
                <tr key={product.id} className="border-b border-line last:border-none">
                  <td className="px-5 py-3 text-ink">{product.name}</td>
                  <td className="px-5 py-3 text-ink-3 line-through">{formatPrice(product.price)}</td>
                  <td className="px-5 py-3 text-ink-2">{formatPrice(product.sale_price!)}</td>
                  <td className={`px-5 py-3 ${expired ? "text-open" : "text-ink-2"}`}>
                    {product.sale_expires_at
                      ? `${new Date(product.sale_expires_at).toLocaleDateString("en-CA")}${expired ? " (expired)" : ""}`
                      : "No end date"}
                  </td>
                </tr>
              );
            })}
            {onSale.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-ink-3">
                  No products currently on sale.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
