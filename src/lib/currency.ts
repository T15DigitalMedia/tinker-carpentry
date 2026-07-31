// Single source of truth for the app's currency — CAD only (v1, single-currency).
// Stripe Checkout Sessions (Phase 3) must pass currency: "cad" to match.
export const CURRENCY = "CAD";

export function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("en-CA", { style: "currency", currency: CURRENCY });
}
