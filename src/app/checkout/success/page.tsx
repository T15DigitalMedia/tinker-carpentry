import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { formatPrice } from "@/lib/currency";
import { Container } from "@/components/ui/container";
import { ClearCartOnSuccess } from "@/components/cart/clear-cart-on-success";

export const metadata: Metadata = { title: "Order confirmed" };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  if (!sessionId) notFound();

  // session_id is an arbitrary, user-controllable query param — an invalid
  // or unrecognized id must 404, not crash the page.
  const session = await stripe.checkout.sessions
    .retrieve(sessionId, { expand: ["line_items"] })
    .catch(() => null);
  if (!session) notFound();

  // Trust Stripe's own record of payment status, not the mere presence of a
  // session id in the URL — that alone proves nothing.
  if (session.payment_status !== "paid") notFound();

  const lineItems = session.line_items?.data ?? [];

  return (
    <Container>
      <div className="mx-auto max-w-lg py-14 text-center">
        <ClearCartOnSuccess />

        <h1 className="font-serif text-3xl font-medium text-ink">Thanks for your order</h1>
        <p className="mt-3 text-ink-2">
          {session.customer_details?.email
            ? `A confirmation has been sent to ${session.customer_details.email}.`
            : "Your payment was successful."}
        </p>

        <ul className="mt-8 divide-y divide-line rounded-ui border border-line text-left">
          {lineItems.map((item) => (
            <li key={item.id} className="flex items-center justify-between px-4 py-3">
              <span className="text-ink">
                {item.description} × {item.quantity}
              </span>
              <span className="text-ink-2">{formatPrice(item.amount_total)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-baseline justify-between border-t border-line px-4 py-3">
          <span className="font-mono text-xs uppercase tracking-wider text-ink-2">Total paid</span>
          <span className="text-lg font-medium text-ink">{formatPrice(session.amount_total ?? 0)}</span>
        </div>

        <p className="mt-6 text-sm text-ink-3">
          Your order is for local pickup — we&apos;ll email you when it&apos;s ready.
        </p>

        <div className="mt-8 flex items-center justify-center gap-6">
          <Link
            href="/track"
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-ink-3 transition-colors hover:text-ink"
          >
            Track your order
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-ink-3 transition-colors hover:text-ink"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </Container>
  );
}
