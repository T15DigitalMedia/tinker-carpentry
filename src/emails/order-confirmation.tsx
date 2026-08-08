import { formatPrice } from "@/lib/currency";
import { SITE_NAME } from "@/lib/site";
import { emailStyles as s } from "./styles";

export type OrderConfirmationEmailItem = {
  name: string;
  quantity: number;
  unitPriceCents: number;
  madeToOrder: boolean;
  leadTimeDays: number | null;
};

export type OrderConfirmationEmailProps = {
  orderRef: string;
  items: OrderConfirmationEmailItem[];
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  couponCode: string | null;
};

export function OrderConfirmationEmail({
  orderRef,
  items,
  subtotalCents,
  discountCents,
  taxCents,
  totalCents,
  couponCode,
}: OrderConfirmationEmailProps) {
  return (
    <html>
      <body style={s.body}>
        <div style={s.container}>
          <h1 style={s.heading}>Thanks for your order</h1>
          <p style={s.orderRef}>Order {orderRef}</p>

          <p style={s.paragraph}>
            We&apos;ve received your payment and we&apos;re getting your order ready. It&apos;s for local pickup —
            we&apos;ll email you again as soon as it&apos;s ready to collect.
          </p>

          <table style={s.table} cellPadding={0} cellSpacing={0}>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td style={s.itemCell}>
                    {item.name} × {item.quantity}
                    {item.madeToOrder && (
                      <p style={s.leadTimeNote}>
                        Made to order
                        {item.leadTimeDays != null &&
                          ` — ready in about ${item.leadTimeDays} day${item.leadTimeDays === 1 ? "" : "s"}`}
                      </p>
                    )}
                  </td>
                  <td style={s.itemPriceCell}>{formatPrice(item.unitPriceCents * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <table style={s.table} cellPadding={0} cellSpacing={0}>
            <tbody>
              <tr>
                <td style={s.totalsLabel}>Subtotal</td>
                <td style={s.totalsValue}>{formatPrice(subtotalCents)}</td>
              </tr>
              {discountCents > 0 && (
                <tr>
                  <td style={s.totalsLabel}>Discount{couponCode ? ` (${couponCode})` : ""}</td>
                  <td style={s.totalsValue}>-{formatPrice(discountCents)}</td>
                </tr>
              )}
              <tr>
                <td style={s.totalsLabel}>Tax</td>
                <td style={s.totalsValue}>{formatPrice(taxCents)}</td>
              </tr>
              <tr>
                <td style={s.totalLabel}>Total paid</td>
                <td style={s.totalValue}>{formatPrice(totalCents)}</td>
              </tr>
            </tbody>
          </table>

          <p style={s.footer}>{SITE_NAME}</p>
        </div>
      </body>
    </html>
  );
}

// Sample data so `npm run email:dev` has something to render — this default
// export isn't used in production sends, only picked up by the react-email
// preview server, which requires one per file.
export default function OrderConfirmationEmailPreview() {
  return (
    <OrderConfirmationEmail
      orderRef="A1B2C3D4"
      items={[
        { name: "Walnut Cutting Board", quantity: 1, unitPriceCents: 6500, madeToOrder: false, leadTimeDays: null },
        { name: "Oak Coffee Table", quantity: 1, unitPriceCents: 45000, madeToOrder: true, leadTimeDays: 14 },
      ]}
      subtotalCents={51500}
      discountCents={500}
      taxCents={2210}
      totalCents={53210}
      couponCode="WELCOME10"
    />
  );
}
