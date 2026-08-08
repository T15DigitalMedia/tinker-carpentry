import { SITE_NAME } from "@/lib/site";
import type { OrderStatus } from "@/lib/orders";
import { emailStyles as s } from "./styles";

// "paid" gets the confirmation email instead, and "collected" happens with
// the customer standing in front of us, so neither needs a status email.
export const ORDER_STATUS_EMAIL_COPY = {
  preparing: {
    subject: `We're preparing your order — ${SITE_NAME}`,
    heading: "Your order is being prepared",
    body: "We've started getting your order ready. We'll email you again as soon as it's ready for pickup.",
  },
  ready_for_pickup: {
    subject: `Your order is ready for pickup — ${SITE_NAME}`,
    heading: "Ready for pickup",
    body: "Your order is ready whenever you are — come by and we'll have it waiting for you.",
  },
  cancelled: {
    subject: `Your order has been cancelled — ${SITE_NAME}`,
    heading: "Order cancelled",
    body: "Your order has been cancelled. If you have any questions, just reply to this email.",
  },
  refunded: {
    subject: `Your order has been refunded — ${SITE_NAME}`,
    heading: "Order refunded",
    body: "Your order has been refunded. Please allow a few business days for it to appear on your statement.",
  },
} as const satisfies Partial<Record<OrderStatus, { subject: string; heading: string; body: string }>>;

export type OrderStatusWithEmail = keyof typeof ORDER_STATUS_EMAIL_COPY;

export function hasStatusUpdateEmail(status: OrderStatus): status is OrderStatusWithEmail {
  return status in ORDER_STATUS_EMAIL_COPY;
}

export type OrderStatusUpdateEmailProps = {
  orderRef: string;
  status: OrderStatusWithEmail;
};

export function OrderStatusUpdateEmail({ orderRef, status }: OrderStatusUpdateEmailProps) {
  const copy = ORDER_STATUS_EMAIL_COPY[status];

  return (
    <html>
      <body style={s.body}>
        <div style={s.container}>
          <h1 style={s.heading}>{copy.heading}</h1>
          <p style={s.orderRef}>Order {orderRef}</p>
          <p style={s.paragraph}>{copy.body}</p>
          <p style={s.footer}>{SITE_NAME}</p>
        </div>
      </body>
    </html>
  );
}

// Preview-only — the react-email dev server requires a default export per
// file. Shows the "ready_for_pickup" variant; swap `status` below to check
// the others (preparing / cancelled / refunded).
export default function OrderStatusUpdateEmailPreview() {
  return <OrderStatusUpdateEmail orderRef="A1B2C3D4" status="ready_for_pickup" />;
}
