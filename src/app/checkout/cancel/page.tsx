import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = { title: "Checkout cancelled" };

export default function CheckoutCancelPage() {
  return (
    <Container>
      <div className="mx-auto max-w-lg py-14 text-center">
        <h1 className="font-serif text-3xl font-medium text-ink">Checkout cancelled</h1>
        <p className="mt-3 text-ink-2">No payment was made — your cart is still waiting for you.</p>

        <Link
          href="/shop"
          className="mt-8 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-ink-3 transition-colors hover:text-ink"
        >
          <span aria-hidden="true">←</span>
          Back to shop
        </Link>
      </div>
    </Container>
  );
}
