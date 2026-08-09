import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { listReviewsForModeration, reviewAggregate, submitReview } from "@/lib/reviews";

describe("reviewAggregate", () => {
  it("returns zero count and a null average for no reviews", () => {
    expect(reviewAggregate([])).toEqual({ count: 0, average: null });
  });

  it("averages the ratings", () => {
    expect(reviewAggregate([{ rating: 5 }, { rating: 3 }, { rating: 4 }])).toEqual({
      count: 3,
      average: 4,
    });
  });

  it("keeps fractional averages precise", () => {
    const { average } = reviewAggregate([{ rating: 5 }, { rating: 4 }]);
    expect(average).toBeCloseTo(4.5);
  });
});

function mockRpc(result: { error: unknown }) {
  const rpc = vi.fn().mockResolvedValue(result);
  return { client: { rpc } as unknown as SupabaseClient, rpc };
}

describe("submitReview", () => {
  const input = {
    orderRef: "A1B2C3D4",
    email: "buyer@example.com",
    productId: "5c9c9c9c-9c9c-4c9c-9c9c-9c9c9c9c9c9c",
    rating: 5,
    body: "Beautifully made.",
  };

  it("calls submit_review with the mapped RPC args and returns ok on success", async () => {
    const { client, rpc } = mockRpc({ error: null });

    const result = await submitReview(client, input);

    expect(rpc).toHaveBeenCalledWith("submit_review", {
      p_order_ref: "A1B2C3D4",
      p_email: "buyer@example.com",
      p_product_id: "5c9c9c9c-9c9c-4c9c-9c9c-9c9c9c9c9c9c",
      p_rating: 5,
      p_body: "Beautifully made.",
    });
    expect(result).toEqual({ ok: true });
  });

  it("relays the RPC's exception message on failure", async () => {
    const { client } = mockRpc({ error: { message: "You have already reviewed this product for this order." } });

    const result = await submitReview(client, input);

    expect(result).toEqual({ ok: false, error: "You have already reviewed this product for this order." });
  });
});

function makeQueryBuilder(result: { data: unknown; error: unknown }) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    in: vi.fn(() => builder),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve),
  };
  return builder;
}

describe("listReviewsForModeration", () => {
  it("joins product name/slug and derives an order ref for each review", async () => {
    const reviewsBuilder = makeQueryBuilder({
      data: [
        {
          id: "review-1",
          product_id: "product-1",
          order_id: "a1b2c3d4-0000-0000-0000-000000000000",
          reviewer_email: "buyer@example.com",
          rating: 5,
          body: "Great",
          status: "pending",
          admin_response: null,
          created_at: "2026-08-08T00:00:00.000Z",
          updated_at: "2026-08-08T00:00:00.000Z",
        },
      ],
      error: null,
    });
    const productsBuilder = makeQueryBuilder({
      data: [{ id: "product-1", name: "Walnut Table", slug: "walnut-table" }],
      error: null,
    });
    const from = vi.fn((table: string) => (table === "reviews" ? reviewsBuilder : productsBuilder));
    const client = { from } as unknown as SupabaseClient;

    const result = await listReviewsForModeration(client, { status: "pending" });

    expect(reviewsBuilder.eq).toHaveBeenCalledWith("status", "pending");
    expect(result).toEqual([
      expect.objectContaining({
        id: "review-1",
        productName: "Walnut Table",
        productSlug: "walnut-table",
        orderRef: "A1B2C3D4",
      }),
    ]);
  });

  it("falls back gracefully when the product no longer exists", async () => {
    const reviewsBuilder = makeQueryBuilder({
      data: [
        {
          id: "review-1",
          product_id: "deleted-product",
          order_id: "a1b2c3d4-0000-0000-0000-000000000000",
          reviewer_email: "buyer@example.com",
          rating: 2,
          body: "Meh",
          status: "pending",
          admin_response: null,
          created_at: "2026-08-08T00:00:00.000Z",
          updated_at: "2026-08-08T00:00:00.000Z",
        },
      ],
      error: null,
    });
    const productsBuilder = makeQueryBuilder({ data: [], error: null });
    const from = vi.fn((table: string) => (table === "reviews" ? reviewsBuilder : productsBuilder));
    const client = { from } as unknown as SupabaseClient;

    const result = await listReviewsForModeration(client);

    expect(result).toEqual([
      expect.objectContaining({ productName: "Deleted product", productSlug: null }),
    ]);
  });

  it("skips the products query and returns an empty list when there are no reviews", async () => {
    const reviewsBuilder = makeQueryBuilder({ data: [], error: null });
    const from = vi.fn(() => reviewsBuilder);
    const client = { from } as unknown as SupabaseClient;

    const result = await listReviewsForModeration(client);

    expect(result).toEqual([]);
    expect(from).toHaveBeenCalledTimes(1);
  });
});
