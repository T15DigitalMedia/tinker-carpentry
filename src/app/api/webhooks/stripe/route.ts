import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Signature verification failed: ${message}` }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // Restricted to card payments at session creation (see t3-4), so
  // "completed" always means synchronously paid — no async payment methods
  // to reconcile via a separate event.
  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true });
  }

  const { data: lineItems, error: lineItemsError } = await stripe.checkout.sessions
    .listLineItems(session.id, { limit: 100 })
    .then(
      (result) => ({ data: result.data, error: null }),
      (err: unknown) => ({ data: null, error: err }),
    );

  if (lineItemsError || !lineItems) {
    return NextResponse.json({ error: "Could not load line items" }, { status: 500 });
  }

  const items = lineItems.map((item) => ({
    product_id: item.metadata?.product_id ?? null,
    product_name: item.description ?? "",
    unit_price: item.quantity ? Math.round(item.amount_subtotal / item.quantity) : item.amount_subtotal,
    quantity: item.quantity ?? 0,
  }));

  const supabase = createServiceClient();
  const { error } = await supabase.rpc("create_order_from_checkout_session", {
    p_stripe_checkout_session_id: session.id,
    p_stripe_payment_intent_id:
      typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null),
    p_customer_email: session.customer_details?.email ?? "",
    p_customer_phone: session.customer_details?.phone ?? null,
    p_subtotal: session.amount_subtotal ?? 0,
    p_discount_cents: session.total_details?.amount_discount ?? 0,
    p_tax_cents: session.total_details?.amount_tax ?? 0,
    p_total: session.amount_total ?? 0,
    p_coupon_code: session.metadata?.coupon_code ?? null,
    p_items: items,
  });

  if (error) {
    // 500 so Stripe retries — create_order_from_checkout_session is
    // idempotent on stripe_checkout_session_id, so a retry is safe.
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
