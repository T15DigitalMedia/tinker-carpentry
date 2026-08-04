"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";

export function AddToCartForm({
  productId,
  slug,
  name,
  price,
  salePrice,
  imageUrl,
  stock,
  madeToOrder,
}: {
  productId: string;
  slug: string;
  name: string;
  price: number;
  salePrice: number | null;
  imageUrl?: string;
  stock: number;
  madeToOrder: boolean;
}) {
  const { addItem, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const outOfStock = stock <= 0 && !madeToOrder;
  const maxQuantity = madeToOrder ? undefined : stock;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded-ui border border-line-strong">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={outOfStock}
          aria-label="Decrease quantity"
          className="flex h-11 w-11 items-center justify-center text-ink-2 hover:bg-panel hover:text-ink disabled:pointer-events-none disabled:opacity-40"
        >
          −
        </button>
        <span className="w-8 text-center text-ink">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity((q) => (maxQuantity != null ? Math.min(maxQuantity, q + 1) : q + 1))}
          disabled={outOfStock || (maxQuantity != null && quantity >= maxQuantity)}
          aria-label="Increase quantity"
          className="flex h-11 w-11 items-center justify-center text-ink-2 hover:bg-panel hover:text-ink disabled:pointer-events-none disabled:opacity-40"
        >
          +
        </button>
      </div>

      <Button
        type="button"
        disabled={outOfStock}
        onClick={() => {
          addItem({ productId, slug, name, price, salePrice, imageUrl, stock, madeToOrder }, quantity);
          openCart();
        }}
        className="flex-1"
      >
        {outOfStock ? "Out of stock" : "Add to cart"}
      </Button>
    </div>
  );
}
