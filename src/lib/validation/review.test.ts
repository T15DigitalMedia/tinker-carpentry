import { describe, expect, it } from "vitest";
import { submitReviewSchema } from "@/lib/validation/review";

const validInput = {
  orderRef: "A1B2C3D4",
  email: "buyer@example.com",
  productId: "5c9c9c9c-9c9c-4c9c-9c9c-9c9c9c9c9c9c",
  rating: "5",
  body: "This table is beautifully made and sturdy.",
};

describe("submitReviewSchema", () => {
  it("accepts valid input and coerces the rating to a number", () => {
    const result = submitReviewSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.rating).toBe(5);
  });

  it("rejects an order reference that isn't 8 hex characters", () => {
    expect(submitReviewSchema.safeParse({ ...validInput, orderRef: "SHORT" }).success).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(submitReviewSchema.safeParse({ ...validInput, email: "not-an-email" }).success).toBe(false);
  });

  it("rejects a rating outside 1-5", () => {
    expect(submitReviewSchema.safeParse({ ...validInput, rating: "6" }).success).toBe(false);
    expect(submitReviewSchema.safeParse({ ...validInput, rating: "0" }).success).toBe(false);
  });

  it("rejects a review body shorter than 10 characters", () => {
    expect(submitReviewSchema.safeParse({ ...validInput, body: "too short" }).success).toBe(false);
  });

  it("rejects a product id that isn't a uuid", () => {
    expect(submitReviewSchema.safeParse({ ...validInput, productId: "not-a-uuid" }).success).toBe(false);
  });
});
