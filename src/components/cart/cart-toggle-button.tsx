"use client";

import { cartItemCount } from "@/lib/cart";
import { useCart } from "@/components/cart/cart-provider";

export function CartToggleButton() {
  const { items, openCart } = useCart();
  const count = cartItemCount(items);

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Open cart${count > 0 ? `, ${count} item${count === 1 ? "" : "s"}` : ""}`}
      className="relative flex h-9 items-center justify-center rounded-ui-sm border border-line-strong px-3 text-ink-2 transition-colors hover:bg-panel hover:text-ink"
    >
      <span className="font-mono text-xs uppercase tracking-wider">Cart</span>
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-walnut px-1 font-mono text-[10px] text-paper">
          {count}
        </span>
      )}
    </button>
  );
}
