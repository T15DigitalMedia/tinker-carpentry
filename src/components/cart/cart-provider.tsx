"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CART_STORAGE_KEY,
  addCartItem,
  removeCartItem,
  updateCartItemQuantity,
  type CartItem,
} from "@/lib/cart";

export type AppliedCoupon = {
  code: string;
  discountCents: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  coupon: AppliedCoupon | null;
  setCoupon: (coupon: AppliedCoupon) => void;
  clearCoupon: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  // Lazy initializer reads localStorage directly so client render matches on
  // the very first paint — no server/client mismatch to patch up in an effect.
  const [items, setItems] = useState<CartItem[]>(readStoredCart);
  const [isOpen, setIsOpen] = useState(false);
  // Not persisted: re-applying forces a fresh server-side check against the
  // current subtotal rather than trusting a discount computed against a cart
  // that may have since changed.
  const [coupon, setCouponState] = useState<AppliedCoupon | null>(null);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem: (item, quantity = 1) => {
        setItems((prev) => addCartItem(prev, item, quantity));
        setCouponState(null);
      },
      updateQuantity: (productId, quantity) => {
        setItems((prev) => updateCartItemQuantity(prev, productId, quantity));
        setCouponState(null);
      },
      removeItem: (productId) => {
        setItems((prev) => removeCartItem(prev, productId));
        setCouponState(null);
      },
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      coupon,
      setCoupon: setCouponState,
      clearCoupon: () => setCouponState(null),
    }),
    [items, isOpen, coupon],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
