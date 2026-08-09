import { describe, expect, it, vi, beforeEach } from "vitest";

const {
  constructEvent,
  listLineItems,
  rpc,
  single,
  getProductsByIds,
  getOrder,
  refundOrderAndRestock,
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
} = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  listLineItems: vi.fn(),
  rpc: vi.fn(),
  single: vi.fn(),
  getProductsByIds: vi.fn(),
  getOrder: vi.fn(),
  refundOrderAndRestock: vi.fn(),
  sendOrderConfirmationEmail: vi.fn(),
  sendOrderStatusUpdateEmail: vi.fn(),
}));

vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: { constructEvent },
    checkout: { sessions: { listLineItems } },
  },
}));

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({ rpc }),
}));

vi.mock("@/lib/products", () => ({ getProductsByIds }));

vi.mock("@/lib/orders", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/orders")>();
  return { ...actual, getOrder, refundOrderAndRestock };
});

vi.mock("@/lib/order-emails", () => ({ sendOrderConfirmationEmail, sendOrderStatusUpdateEmail }));

import { POST } from "@/app/api/webhooks/stripe/route";

function makeRequest(body: string, signature: string | null = "test-signature") {
  const headers = new Headers();
  if (signature) headers.set("stripe-signature", signature);
  return new Request("https://example.com/api/webhooks/stripe", {
    method: "POST",
    headers,
    body,
  });
}

function checkoutSessionCompletedEvent(overrides: Record<string, unknown> = {}) {
  return {
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test_123",
        payment_status: "paid",
        payment_intent: "pi_test_123",
        customer_details: { email: "buyer@example.com", phone: "+15555550100" },
        amount_subtotal: 2000,
        amount_total: 1800,
        total_details: { amount_discount: 200, amount_tax: 0 },
        metadata: { coupon_code: "SAVE10" },
        ...overrides,
      },
    },
  };
}

function chargeRefundedEvent(overrides: Record<string, unknown> = {}) {
  return {
    type: "charge.refunded",
    data: {
      object: {
        refunded: true,
        payment_intent: "pi_test_123",
        ...overrides,
      },
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  rpc.mockReturnValue({ single });
  getProductsByIds.mockResolvedValue([]);
});

describe("POST /api/webhooks/stripe", () => {
  it("returns 400 when the stripe-signature header is missing", async () => {
    const response = await POST(makeRequest("{}", null));
    expect(response.status).toBe(400);
    expect(constructEvent).not.toHaveBeenCalled();
  });

  it("returns 400 when signature verification fails", async () => {
    constructEvent.mockImplementation(() => {
      throw new Error("bad signature");
    });

    const response = await POST(makeRequest("{}"));

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("bad signature");
  });

  it("acknowledges but ignores event types other than checkout.session.completed or charge.refunded", async () => {
    constructEvent.mockReturnValue({ type: "payment_intent.succeeded", data: { object: {} } });

    const response = await POST(makeRequest("{}"));

    expect(response.status).toBe(200);
    expect(listLineItems).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  describe("checkout.session.completed", () => {
    it("acknowledges but skips order creation when payment_status is not paid", async () => {
      constructEvent.mockReturnValue(checkoutSessionCompletedEvent({ payment_status: "unpaid" }));

      const response = await POST(makeRequest("{}"));

      expect(response.status).toBe(200);
      expect(listLineItems).not.toHaveBeenCalled();
      expect(rpc).not.toHaveBeenCalled();
    });

    it("returns 500 when line items can't be loaded from Stripe", async () => {
      constructEvent.mockReturnValue(checkoutSessionCompletedEvent());
      listLineItems.mockRejectedValue(new Error("network error"));

      const response = await POST(makeRequest("{}"));

      expect(response.status).toBe(500);
      expect(rpc).not.toHaveBeenCalled();
    });

    it("creates an order from the checkout session on success and emails the confirmation", async () => {
      constructEvent.mockReturnValue(checkoutSessionCompletedEvent());
      listLineItems.mockResolvedValue({
        data: [
          {
            description: "Walnut Cutting Board",
            quantity: 2,
            amount_subtotal: 2000,
            metadata: { product_id: "prod_1" },
          },
        ],
      });
      single.mockResolvedValue({ data: { order_id: "order-1", is_new: true }, error: null });
      getProductsByIds.mockResolvedValue([{ id: "prod_1", made_to_order: true, lead_time_days: 5 }]);

      const response = await POST(makeRequest("{}"));

      expect(response.status).toBe(200);
      expect(rpc).toHaveBeenCalledWith(
        "create_order_from_checkout_session",
        expect.objectContaining({
          p_stripe_checkout_session_id: "cs_test_123",
          p_stripe_payment_intent_id: "pi_test_123",
          p_customer_email: "buyer@example.com",
          p_customer_phone: "+15555550100",
          p_subtotal: 2000,
          p_discount_cents: 200,
          p_tax_cents: 0,
          p_total: 1800,
          p_coupon_code: "SAVE10",
          p_items: [
            {
              product_id: "prod_1",
              product_name: "Walnut Cutting Board",
              unit_price: 1000,
              quantity: 2,
            },
          ],
        }),
      );
      expect(sendOrderConfirmationEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "buyer@example.com",
          orderRef: "ORDER-1",
          items: [
            expect.objectContaining({
              name: "Walnut Cutting Board",
              quantity: 2,
              unitPriceCents: 1000,
              madeToOrder: true,
              leadTimeDays: 5,
            }),
          ],
          subtotalCents: 2000,
          discountCents: 200,
          taxCents: 0,
          totalCents: 1800,
          couponCode: "SAVE10",
        }),
      );
    });

    it("does not re-send the confirmation email on a Stripe retry of an already-fulfilled session", async () => {
      constructEvent.mockReturnValue(checkoutSessionCompletedEvent());
      listLineItems.mockResolvedValue({ data: [] });
      single.mockResolvedValue({ data: { order_id: "order-1", is_new: false }, error: null });

      const response = await POST(makeRequest("{}"));

      expect(response.status).toBe(200);
      expect(sendOrderConfirmationEmail).not.toHaveBeenCalled();
    });

    it("returns 500 so Stripe retries when order creation fails", async () => {
      constructEvent.mockReturnValue(checkoutSessionCompletedEvent());
      listLineItems.mockResolvedValue({ data: [] });
      single.mockResolvedValue({ data: null, error: { message: "duplicate key" } });

      const response = await POST(makeRequest("{}"));

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe("duplicate key");
      expect(sendOrderConfirmationEmail).not.toHaveBeenCalled();
    });
  });

  describe("charge.refunded", () => {
    it("restocks and emails when the charge is fully refunded and matches an order", async () => {
      constructEvent.mockReturnValue(chargeRefundedEvent());
      refundOrderAndRestock.mockResolvedValue({ orderId: "order-1", transitioned: true });
      getOrder.mockResolvedValue({ id: "order-1", customer_email: "buyer@example.com" });

      const response = await POST(makeRequest("{}"));

      expect(response.status).toBe(200);
      expect(refundOrderAndRestock).toHaveBeenCalledWith(expect.anything(), "pi_test_123");
      expect(sendOrderStatusUpdateEmail).toHaveBeenCalledWith({
        to: "buyer@example.com",
        orderRef: "ORDER-1",
        status: "refunded",
      });
    });

    it("ignores a partial refund", async () => {
      constructEvent.mockReturnValue(chargeRefundedEvent({ refunded: false }));

      const response = await POST(makeRequest("{}"));

      expect(response.status).toBe(200);
      expect(refundOrderAndRestock).not.toHaveBeenCalled();
    });

    it("does nothing when no order matches the payment intent", async () => {
      constructEvent.mockReturnValue(chargeRefundedEvent());
      refundOrderAndRestock.mockResolvedValue(null);

      const response = await POST(makeRequest("{}"));

      expect(response.status).toBe(200);
      expect(getOrder).not.toHaveBeenCalled();
      expect(sendOrderStatusUpdateEmail).not.toHaveBeenCalled();
    });

    it("does not re-send the email when the order was already refunded (redelivered event)", async () => {
      constructEvent.mockReturnValue(chargeRefundedEvent());
      refundOrderAndRestock.mockResolvedValue({ orderId: "order-1", transitioned: false });

      const response = await POST(makeRequest("{}"));

      expect(response.status).toBe(200);
      expect(sendOrderStatusUpdateEmail).not.toHaveBeenCalled();
    });

    it("returns 500 so Stripe retries when restocking fails", async () => {
      constructEvent.mockReturnValue(chargeRefundedEvent());
      refundOrderAndRestock.mockRejectedValue(new Error("db unavailable"));

      const response = await POST(makeRequest("{}"));

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe("db unavailable");
    });
  });
});
