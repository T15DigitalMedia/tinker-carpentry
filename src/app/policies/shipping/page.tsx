import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shipping policy" };

export default function ShippingPolicyPage() {
  return (
    <article className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-medium text-ink">Shipping policy</h1>
        <p className="mt-2 font-mono text-xs uppercase tracking-wider text-ink-3">Placeholder — last updated TBD</p>
      </div>

      <p className="text-ink-2">
        Placeholder copy: this page should explain how orders reach the customer — local pickup, local delivery,
        and/or shipped orders — and what to expect for each.
      </p>

      <section>
        <h2 className="font-serif text-xl font-medium text-ink">Local pickup</h2>
        <p className="mt-2 text-ink-2">
          Placeholder: pickup location, hours, and how customers are notified when an order is ready to collect.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl font-medium text-ink">Shipped orders</h2>
        <p className="mt-2 text-ink-2">
          Placeholder: which regions are served, carrier(s) used, typical transit time, and how shipping cost is
          calculated (flat rate, by weight/size, or built into the item price).
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl font-medium text-ink">Made-to-order lead times</h2>
        <p className="mt-2 text-ink-2">
          Placeholder: how lead time for made-to-order pieces factors into the overall delivery estimate shown at
          checkout.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl font-medium text-ink">Damaged in transit</h2>
        <p className="mt-2 text-ink-2">
          Placeholder: what to do if a shipped item arrives damaged, and the window for reporting it.
        </p>
      </section>
    </article>
  );
}
