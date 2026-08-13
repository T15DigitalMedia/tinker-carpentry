import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPolicyPage() {
  return (
    <article className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-medium text-ink">Privacy policy</h1>
        <p className="mt-2 font-mono text-xs uppercase tracking-wider text-ink-3">Placeholder — last updated TBD</p>
      </div>

      <p className="text-ink-2">
        Placeholder copy: this page should describe, in plain language, what personal information is collected
        and why. Have this reviewed before launch — it should accurately describe the systems actually in use
        (this store currently processes orders and payments via Stripe, and sends order/contact emails via
        Resend).
      </p>

      <section>
        <h2 className="font-serif text-xl font-medium text-ink">Information we collect</h2>
        <p className="mt-2 text-ink-2">
          Placeholder: name, email, shipping/billing address, and order history collected at checkout; name,
          email, and message content submitted through the contact form.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl font-medium text-ink">How it&apos;s used</h2>
        <p className="mt-2 text-ink-2">
          Placeholder: to fulfill orders, respond to inquiries, and send order-related emails. Not sold to third
          parties.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl font-medium text-ink">Third parties</h2>
        <p className="mt-2 text-ink-2">
          Placeholder: payment processing is handled by Stripe; transactional email is sent via Resend. Link to
          each provider&apos;s own privacy policy here.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl font-medium text-ink">Your choices</h2>
        <p className="mt-2 text-ink-2">
          Placeholder: how a customer can request their data or ask for it to be deleted, and how to reach us
          about it.
        </p>
      </section>
    </article>
  );
}
