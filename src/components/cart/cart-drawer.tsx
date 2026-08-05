"use client";

import Image from "next/image";
import { useId, useState, useTransition } from "react";
import { formatPrice } from "@/lib/currency";
import { cartSubtotal } from "@/lib/cart";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { applyCoupon } from "@/app/shop/actions";
import { createCheckoutSession } from "@/app/checkout/actions";
import type { CouponRejectionReason } from "@/lib/coupons";

const REJECTION_MESSAGES: Record<CouponRejectionReason, string> = {
  not_found: "That coupon code doesn't exist.",
  inactive: "That coupon is no longer active.",
  expired: "That coupon has expired.",
  usage_limit_reached: "That coupon has reached its usage limit.",
  below_minimum: "Your order doesn't meet this coupon's minimum.",
};

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, coupon, setCoupon, clearCoupon } = useCart();
  const headingId = useId();
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, startApplyingCoupon] = useTransition();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isCheckingOut, startCheckingOut] = useTransition();

  if (!isOpen) return null;

  const subtotal = cartSubtotal(items);
  const discountCents = coupon?.discountCents ?? 0;
  const total = Math.max(0, subtotal - discountCents);

  function handleApplyCoupon() {
    setCouponError(null);
    startApplyingCoupon(async () => {
      const result = await applyCoupon(couponCode, subtotal);
      if (result.valid) {
        setCoupon({ code: couponCode.trim(), discountCents: result.discountCents });
        setCouponCode("");
      } else {
        setCouponError(REJECTION_MESSAGES[result.reason]);
      }
    });
  }

  function handleCheckout() {
    setCheckoutError(null);
    startCheckingOut(async () => {
      const result = await createCheckoutSession({
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        couponCode: coupon?.code,
      });
      if (result.ok) {
        window.location.href = result.url;
      } else {
        setCheckoutError(result.error);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close cart"
        onClick={closeCart}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="animate-drop-in relative flex h-full w-full max-w-sm flex-col bg-paper shadow-ui-lg"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id={headingId} className="font-serif text-lg font-medium text-ink">
            Your cart
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="flex h-8 w-8 items-center justify-center rounded-ui-sm text-ink-2 transition-colors hover:bg-panel hover:text-ink"
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <p className="flex-1 px-5 py-10 text-center text-sm text-ink-3">Your cart is empty.</p>
        ) : (
          <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-4 py-4">
                <div className="relative aspect-square w-16 shrink-0 overflow-hidden rounded-ui-sm border border-line bg-paper-2">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt="" fill sizes="64px" className="object-cover" />
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col gap-1.5">
                  <span className="font-medium text-ink">{item.name}</span>
                  <span className="text-sm text-ink-2">{formatPrice(item.salePrice ?? item.price)}</span>

                  <div className="mt-auto flex items-center gap-3">
                    <div className="flex items-center rounded-ui-sm border border-line-strong">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        aria-label={`Decrease quantity of ${item.name}`}
                        className="flex h-7 w-7 items-center justify-center text-ink-2 hover:bg-panel hover:text-ink"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm text-ink">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={!item.madeToOrder && item.quantity >= item.stock}
                        aria-label={`Increase quantity of ${item.name}`}
                        className="flex h-7 w-7 items-center justify-center text-ink-2 hover:bg-panel hover:text-ink disabled:pointer-events-none disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="font-mono text-[10px] uppercase tracking-wider text-ink-3 hover:text-ink"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="border-t border-line px-5 py-4">
          {coupon ? (
            <div className="mb-4 flex items-center justify-between rounded-ui-sm border border-ok/40 bg-ok/10 px-3 py-2">
              <span className="font-mono text-xs uppercase tracking-wider text-ok">{coupon.code} applied</span>
              <button
                type="button"
                onClick={clearCoupon}
                className="font-mono text-[10px] uppercase tracking-wider text-ink-3 hover:text-ink"
              >
                Remove
              </button>
            </div>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleApplyCoupon();
              }}
              className="mb-4 flex gap-2"
            >
              <input
                type="text"
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                placeholder="Coupon code"
                disabled={isApplyingCoupon}
                className="min-w-0 flex-1 rounded-ui-sm border border-line-strong bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              />
              <Button
                type="submit"
                variant="secondary"
                disabled={couponCode.trim().length === 0 || isApplyingCoupon}
              >
                {isApplyingCoupon ? "Checking…" : "Apply"}
              </Button>
            </form>
          )}
          {couponError && <p className="mb-4 -mt-2 text-sm text-open">{couponError}</p>}

          <div className="mb-1 flex items-baseline justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-ink-2">Subtotal</span>
            <span className="text-ink">{formatPrice(subtotal)}</span>
          </div>
          {coupon && (
            <div className="mb-1 flex items-baseline justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-ink-2">Discount</span>
              <span className="text-ok">−{formatPrice(discountCents)}</span>
            </div>
          )}
          <div className="mb-4 flex items-baseline justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-ink-2">Total</span>
            <span className="text-lg font-medium text-ink">{formatPrice(total)}</span>
          </div>

          {checkoutError && <p className="mb-3 text-sm text-open">{checkoutError}</p>}

          <Button
            type="button"
            onClick={handleCheckout}
            disabled={items.length === 0 || isCheckingOut}
            className="w-full"
          >
            {isCheckingOut ? "Redirecting…" : "Checkout"}
          </Button>
        </div>
      </div>
    </div>
  );
}
