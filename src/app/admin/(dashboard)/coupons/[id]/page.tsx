import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCoupon } from "@/lib/coupons";
import { CouponForm } from "@/components/admin/coupon-form";
import { updateCouponAction, deleteCouponAction } from "../actions";

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  let coupon;
  try {
    coupon = await getCoupon(supabase, id);
  } catch {
    notFound();
  }

  const boundUpdate = updateCouponAction.bind(null, id);
  const boundDelete = deleteCouponAction.bind(null, id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-medium text-ink">{coupon.code}</h1>
        <form action={boundDelete}>
          <button
            type="submit"
            className="font-mono text-xs uppercase tracking-wider text-red-700 hover:underline"
          >
            Delete
          </button>
        </form>
      </div>

      <div className="mt-6">
        <CouponForm action={boundUpdate} coupon={coupon} submitLabel="Save changes" />
      </div>
    </div>
  );
}
