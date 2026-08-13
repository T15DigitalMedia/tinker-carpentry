import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of service" };

export default function TermsPolicyPage() {
  return (
    <article className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-medium text-ink">Terms of service</h1>
        <p className="mt-2 font-mono text-xs uppercase tracking-wider text-ink-3">Placeholder — last updated TBD</p>
      </div>

      <p className="text-ink-2">
        Placeholder copy: the terms that govern use of this site and purchases made through it. Have this
        reviewed before launch.
      </p>

      <section>
        <h2 className="font-serif text-xl font-medium text-ink">Orders &amp; payment</h2>
        <p className="mt-2 text-ink-2">
          Placeholder: payment is due in full at checkout via Stripe; order confirmation is sent by email once
          payment succeeds.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl font-medium text-ink">Pricing &amp; availability</h2>
        <p className="mt-2 text-ink-2">
          Placeholder: prices and stock are subject to change without notice; made-to-order items are built after
          the order is placed.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl font-medium text-ink">Product descriptions</h2>
        <p className="mt-2 text-ink-2">
          Placeholder: handmade pieces vary slightly from photos due to natural wood grain and finish — this is
          expected, not a defect.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl font-medium text-ink">Contact</h2>
        <p className="mt-2 text-ink-2">
          Placeholder: point to the contact page for questions about these terms.
        </p>
      </section>
    </article>
  );
}
