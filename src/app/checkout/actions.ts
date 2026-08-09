"use server";

import type Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { effectiveSalePrice, getProductsByIds } from "@/lib/products";
import { validateCoupon } from "@/lib/coupons";
import { checkoutInputSchema, type CheckoutInput } from "@/lib/validation/checkout";
import { stripe } from "@/lib/stripe";
import { SITE_URL } from "@/lib/site";
import { CURRENCY } from "@/lib/currency";

export type CreateCheckoutSessionResult = { ok: true; url: string } | { ok: false; error: string };

export async function createCheckoutSession(input: CheckoutInput): Promise<CreateCheckoutSessionResult> {
  const parsed = checkoutInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Your cart looks invalid. Please refresh and try again." };
  }
  const { items, couponCode } = parsed.data;

  const supabase = await createClient();
  const products = await getProductsByIds(
    supabase,
    items.map((item) => item.productId),
  );
  const productsById = new Map(products.map((product) => [product.id, product]));

  // Totals are computed from freshly-fetched product rows, never from
  // client-supplied prices/stock, so a tampered cart can't under-charge.
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  let subtotal = 0;

  for (const { productId, quantity } of items) {
    const product = productsById.get(productId);
    if (!product || !product.is_active) {
      return { ok: false, error: "One or more items in your cart are no longer available." };
    }
    if (!product.made_to_order && quantity > product.stock) {
      return { ok: false, error: `Only ${product.stock} of "${product.name}" left in stock.` };
    }

    const unitAmount = effectiveSalePrice(product) ?? product.price;
    subtotal += unitAmount * quantity;

    lineItems.push({
      quantity,
      metadata: { product_id: product.id },
      price_data: {
        currency: CURRENCY.toLowerCase(),
        unit_amount: unitAmount,
        product_data: { name: product.name },
      },
    });
  }

  const discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];
  if (couponCode) {
    const couponResult = await validateCoupon(supabase, couponCode, subtotal);
    if (!couponResult.valid) {
      return { ok: false, error: "Your coupon is no longer valid — remove it and try again." };
    }
    if (couponResult.discountCents > 0) {
      const stripeCoupon = await stripe.coupons.create({
        amount_off: couponResult.discountCents,
        currency: CURRENCY.toLowerCase(),
        duration: "once",
        name: couponCode,
      });
      discounts.push({ coupon: stripeCoupon.id });
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    // Card only: some other methods confirm asynchronously, which would mean
    // "checkout.session.completed" doesn't always imply paid and the webhook
    // (t3-7) would need a second event type to reconcile later payment.
    payment_method_types: ["card"],
    line_items: lineItems,
    discounts: discounts.length > 0 ? discounts : undefined,
    automatic_tax: { enabled: true },
    // This Stripe account has Managed Payments (Stripe as merchant of
    // record) on by default, which requires a tax_code per product. We stay
    // merchant of record and use plain Stripe Tax instead (see t3-5).
    managed_payments: { enabled: false },
    // Fulfillment is local pickup only (v1, no carrier rates) — no shipping
    // address/options are collected. A phone number lets us reach the
    // customer when their order is ready (see t4-3).
    phone_number_collection: { enabled: true },
    custom_text: {
      submit: { message: "Orders are for local pickup only. We'll email you when yours is ready." },
    },
    // Read back by the webhook (t3-7) to know which coupon to credit usage
    // against — Stripe's own coupon object on the session has no link back
    // to ours.
    metadata: couponCode ? { coupon_code: couponCode } : undefined,
    success_url: `${SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/checkout/cancel`,
  });

  if (!session.url) {
    return { ok: false, error: "Could not start checkout. Please try again." };
  }

  return { ok: true, url: session.url };
}
