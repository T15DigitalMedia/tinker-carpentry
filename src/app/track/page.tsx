import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { TrackOrderForm } from "@/components/track/track-order-form";

export const metadata: Metadata = { title: "Track your order" };

export default function TrackOrderPage() {
  return (
    <Container>
      <div className="mx-auto max-w-lg py-14">
        <h1 className="font-serif text-3xl font-medium text-ink">Track your order</h1>
        <p className="mt-3 text-ink-2">
          Enter the order reference from your confirmation email along with the email you used at checkout.
        </p>

        <div className="mt-8">
          <TrackOrderForm />
        </div>
      </div>
    </Container>
  );
}
