import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <Container>
      <div className="mx-auto max-w-lg py-14">
        <h1 className="font-serif text-3xl font-medium text-ink">Get in touch</h1>
        <p className="mt-3 text-ink-2">
          Questions about a piece, a custom commission, or an existing order? Send a message and we&apos;ll reply
          within a couple of business days.
        </p>

        <div className="mt-8">
          <ContactForm />
        </div>
      </div>
    </Container>
  );
}
