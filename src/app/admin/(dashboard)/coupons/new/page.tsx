import { CouponForm } from "@/components/admin/coupon-form";
import { createCouponAction } from "../actions";

export default function NewCouponPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-medium text-ink">New coupon</h1>
      <div className="mt-6">
        <CouponForm action={createCouponAction} submitLabel="Create coupon" />
      </div>
    </div>
  );
}
