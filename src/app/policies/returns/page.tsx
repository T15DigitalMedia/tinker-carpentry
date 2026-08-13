import type { Metadata } from "next";

export const metadata: Metadata = { title: "Returns policy" };

export default function ReturnsPolicyPage() {
  return (
    <article className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-medium text-ink">Returns &amp; exchanges</h1>
        <p className="mt-2 font-mono text-xs uppercase tracking-wider text-ink-3">Placeholder — last updated TBD</p>
      </div>

      <p className="text-ink-2">
        Placeholder copy: handmade goods often have a different returns approach than mass-produced retail — this
        page should set clear, honest expectations before a customer buys.
      </p>

      <section>
        <h2 className="font-serif text-xl font-medium text-ink">Ready-made pieces</h2>
        <p className="mt-2 text-ink-2">
          Placeholder: the return window (e.g. 14 days), required condition, who covers return shipping, and how
          refunds are issued.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl font-medium text-ink">Made-to-order &amp; custom pieces</h2>
        <p className="mt-2 text-ink-2">
          Placeholder: whether custom/commissioned work is final sale, or under what conditions it can be
          cancelled or altered once production has started.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl font-medium text-ink">Defects &amp; damage</h2>
        <p className="mt-2 text-ink-2">
          Placeholder: how to report a manufacturing defect or shipping damage, and what the resolution looks like
          (repair, replace, or refund).
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl font-medium text-ink">How to start a return</h2>
        <p className="mt-2 text-ink-2">
          Placeholder: point customers to the contact page with their order reference to begin a return or
          exchange.
        </p>
      </section>
    </article>
  );
}
