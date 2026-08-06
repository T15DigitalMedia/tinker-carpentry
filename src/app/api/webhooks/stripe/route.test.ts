import { describe, expect, it, vi, beforeEach } from "vitest";

const { constructEvent, listLineItems, rpc } = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  listLineItems: vi.fn(),
  rpc: vi.fn(),
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

beforeEach(() => {
  vi.clearAllMocks();
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
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

  it("acknowledges but ignores event types other than checkout.session.completed", async () => {
    constructEvent.mockReturnValue({ type: "payment_intent.succeeded", data: { object: {} } });

    const response = await POST(makeRequest("{}"));

    expect(response.status).toBe(200);
    expect(listLineItems).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

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

  it("creates an order from the checkout session on success", async () => {
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
    rpc.mockResolvedValue({ error: null });

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
  });

  it("returns 500 so Stripe retries when order creation fails", async () => {
    constructEvent.mockReturnValue(checkoutSessionCompletedEvent());
    listLineItems.mockResolvedValue({ data: [] });
    rpc.mockResolvedValue({ error: { message: "duplicate key" } });

    const response = await POST(makeRequest("{}"));

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("duplicate key");
  });
});
