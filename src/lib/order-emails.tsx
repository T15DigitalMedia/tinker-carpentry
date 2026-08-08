import * as Sentry from "@sentry/nextjs";
import { render } from "@react-email/render";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { SITE_NAME } from "@/lib/site";
import type { OrderStatus } from "@/lib/orders";
import { OrderConfirmationEmail, type OrderConfirmationEmailItem } from "@/emails/order-confirmation";
import { OrderStatusUpdateEmail, ORDER_STATUS_EMAIL_COPY, hasStatusUpdateEmail } from "@/emails/order-status-update";

export type OrderConfirmationEmailInput = {
  to: string;
  orderRef: string;
  items: OrderConfirmationEmailItem[];
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  couponCode: string | null;
};

async function send(to: string, subject: string, element: React.ReactElement) {
  // Email is a courtesy notification, not part of order integrity — a
  // Resend outage must not fail the webhook or the admin's status update,
  // both of which have already durably recorded the thing the email is
  // just announcing. Report to Sentry instead of throwing.
  try {
    const [html, text] = await Promise.all([render(element), render(element, { plainText: true })]);
    await resend.emails.send({ from: EMAIL_FROM, to, subject, html, text });
  } catch (err) {
    Sentry.captureException(err);
  }
}

export function sendOrderConfirmationEmail({ to, ...props }: OrderConfirmationEmailInput) {
  return send(to, `Order confirmed — ${SITE_NAME}`, <OrderConfirmationEmail {...props} />);
}

export function sendOrderStatusUpdateEmail({
  to,
  orderRef,
  status,
}: {
  to: string;
  orderRef: string;
  status: OrderStatus;
}) {
  if (!hasStatusUpdateEmail(status)) return Promise.resolve();

  return send(
    to,
    ORDER_STATUS_EMAIL_COPY[status].subject,
    <OrderStatusUpdateEmail orderRef={orderRef} status={status} />,
  );
}
