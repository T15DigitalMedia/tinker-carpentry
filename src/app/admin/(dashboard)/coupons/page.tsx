import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listCoupons } from "@/lib/coupons";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/currency";

function formatDiscount(discountType: "percent" | "fixed", discountValue: number) {
  return discountType === "percent" ? `${discountValue}% off` : `${formatPrice(discountValue)} off`;
}

export default async function AdminCouponsPage() {
  const supabase = await createClient();
  const coupons = await listCoupons(supabase);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-medium text-ink">Coupons</h1>
        <Link href="/admin/coupons/new">
          <Button>New coupon</Button>
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-ui border border-line bg-paper shadow-ui-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-panel font-mono text-xs uppercase tracking-wider text-ink-3">
              <th className="px-5 py-3">Code</th>
              <th className="px-5 py-3">Discount</th>
              <th className="px-5 py-3">Usage</th>
              <th className="px-5 py-3">Expires</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="border-b border-line last:border-none hover:bg-panel/60">
                <td className="px-5 py-3">
                  <Link href={`/admin/coupons/${coupon.id}`} className="font-mono text-ink hover:text-walnut">
                    {coupon.code}
                  </Link>
                </td>
                <td className="px-5 py-3 text-ink-2">{formatDiscount(coupon.discount_type, coupon.discount_value)}</td>
                <td className="px-5 py-3 text-ink-2">
                  {coupon.times_used}
                  {coupon.usage_limit != null ? ` / ${coupon.usage_limit}` : ""}
                </td>
                <td className="px-5 py-3 text-ink-2">
                  {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString("en-CA") : "Never"}
                </td>
                <td className="px-5 py-3 text-ink-2">{coupon.is_active ? "Active" : "Inactive"}</td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-ink-3">
                  No coupons yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
