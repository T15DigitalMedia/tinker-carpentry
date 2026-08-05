export const CART_STORAGE_KEY = "tinker-carpentry:cart";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  salePrice: number | null;
  imageUrl?: string;
  stock: number;
  madeToOrder: boolean;
  quantity: number;
};

function clampQuantity(item: Pick<CartItem, "stock" | "madeToOrder">, quantity: number) {
  const max = item.madeToOrder ? Number.MAX_SAFE_INTEGER : item.stock;
  return Math.max(0, Math.min(quantity, max));
}

export function addCartItem(
  items: CartItem[],
  item: Omit<CartItem, "quantity">,
  quantity = 1,
): CartItem[] {
  const existing = items.find((i) => i.productId === item.productId);

  if (existing) {
    const nextQuantity = clampQuantity(existing, existing.quantity + quantity);
    return items.map((i) => (i.productId === item.productId ? { ...i, quantity: nextQuantity } : i));
  }

  const nextQuantity = clampQuantity(item, quantity);
  if (nextQuantity <= 0) return items;
  return [...items, { ...item, quantity: nextQuantity }];
}

export function updateCartItemQuantity(items: CartItem[], productId: string, quantity: number): CartItem[] {
  return items
    .map((item) => (item.productId === productId ? { ...item, quantity: clampQuantity(item, quantity) } : item))
    .filter((item) => item.quantity > 0);
}

export function removeCartItem(items: CartItem[], productId: string): CartItem[] {
  return items.filter((item) => item.productId !== productId);
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + (item.salePrice ?? item.price) * item.quantity, 0);
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
