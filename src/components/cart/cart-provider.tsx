"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CART_STORAGE_KEY,
  addCartItem,
  removeCartItem,
  updateCartItemQuantity,
  type CartItem,
} from "@/lib/cart";

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
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

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem: (item, quantity = 1) => setItems((prev) => addCartItem(prev, item, quantity)),
      updateQuantity: (productId, quantity) =>
        setItems((prev) => updateCartItemQuantity(prev, productId, quantity)),
      removeItem: (productId) => setItems((prev) => removeCartItem(prev, productId)),
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    }),
    [items, isOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
