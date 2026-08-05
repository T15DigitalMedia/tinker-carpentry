import { describe, expect, it } from "vitest";
import {
  addCartItem,
  cartItemCount,
  cartSubtotal,
  removeCartItem,
  updateCartItemQuantity,
  type CartItem,
} from "@/lib/cart";

function makeItem(overrides: Partial<CartItem> = {}): Omit<CartItem, "quantity"> {
  return {
    productId: "p1",
    slug: "widget",
    name: "Widget",
    price: 1000,
    salePrice: null,
    stock: 5,
    madeToOrder: false,
    ...overrides,
  };
}

describe("addCartItem", () => {
  it("adds a new item with the given quantity", () => {
    const result = addCartItem([], makeItem(), 2);
    expect(result).toEqual([{ ...makeItem(), quantity: 2 }]);
  });

  it("defaults to a quantity of 1", () => {
    const result = addCartItem([], makeItem());
    expect(result[0].quantity).toBe(1);
  });

  it("increments quantity when the item already exists", () => {
    const existing: CartItem[] = [{ ...makeItem(), quantity: 2 }];
    const result = addCartItem(existing, makeItem(), 1);
    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(3);
  });

  it("clamps quantity to available stock for non made-to-order items", () => {
    const result = addCartItem([], makeItem({ stock: 3 }), 10);
    expect(result[0].quantity).toBe(3);
  });

  it("does not clamp quantity for made-to-order items", () => {
    const result = addCartItem([], makeItem({ stock: 0, madeToOrder: true }), 500);
    expect(result[0].quantity).toBe(500);
  });

  it("drops the item entirely if clamped quantity is zero or less", () => {
    const result = addCartItem([], makeItem({ stock: 0, madeToOrder: false }), 1);
    expect(result).toEqual([]);
  });

  it("does not mutate the original items array", () => {
    const original: CartItem[] = [{ ...makeItem(), quantity: 1 }];
    const result = addCartItem(original, makeItem(), 1);
    expect(original[0].quantity).toBe(1);
    expect(result).not.toBe(original);
  });
});

describe("updateCartItemQuantity", () => {
  const items: CartItem[] = [{ ...makeItem(), quantity: 2 }];

  it("updates the quantity of the matching item", () => {
    const result = updateCartItemQuantity(items, "p1", 4);
    expect(result[0].quantity).toBe(4);
  });

  it("clamps the updated quantity to stock", () => {
    const result = updateCartItemQuantity(items, "p1", 100);
    expect(result[0].quantity).toBe(5);
  });

  it("removes the item once quantity is clamped to zero", () => {
    const result = updateCartItemQuantity(items, "p1", 0);
    expect(result).toEqual([]);
  });

  it("removes the item when quantity goes negative", () => {
    const result = updateCartItemQuantity(items, "p1", -5);
    expect(result).toEqual([]);
  });

  it("leaves other items untouched", () => {
    const other = { ...makeItem({ productId: "p2" }), quantity: 1 };
    const result = updateCartItemQuantity([...items, other], "p1", 1);
    expect(result).toContainEqual(other);
  });
});

describe("removeCartItem", () => {
  it("removes the item with the matching productId", () => {
    const items: CartItem[] = [
      { ...makeItem(), quantity: 1 },
      { ...makeItem({ productId: "p2" }), quantity: 1 },
    ];
    const result = removeCartItem(items, "p1");
    expect(result).toHaveLength(1);
    expect(result[0].productId).toBe("p2");
  });

  it("is a no-op if the productId is not present", () => {
    const items: CartItem[] = [{ ...makeItem(), quantity: 1 }];
    expect(removeCartItem(items, "missing")).toEqual(items);
  });
});

describe("cartSubtotal", () => {
  it("sums price * quantity across items", () => {
    const items: CartItem[] = [
      { ...makeItem({ price: 1000 }), quantity: 2 },
      { ...makeItem({ productId: "p2", price: 500 }), quantity: 3 },
    ];
    expect(cartSubtotal(items)).toBe(1000 * 2 + 500 * 3);
  });

  it("prefers salePrice over price when present", () => {
    const items: CartItem[] = [{ ...makeItem({ price: 1000, salePrice: 700 }), quantity: 2 }];
    expect(cartSubtotal(items)).toBe(1400);
  });

  it("returns 0 for an empty cart", () => {
    expect(cartSubtotal([])).toBe(0);
  });
});

describe("cartItemCount", () => {
  it("sums quantities across items", () => {
    const items: CartItem[] = [
      { ...makeItem(), quantity: 2 },
      { ...makeItem({ productId: "p2" }), quantity: 3 },
    ];
    expect(cartItemCount(items)).toBe(5);
  });

  it("returns 0 for an empty cart", () => {
    expect(cartItemCount([])).toBe(0);
  });
});
