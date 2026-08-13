import { describe, expect, it } from "vitest";
import { contactSchema } from "@/lib/validation/contact";

const validInput = {
  name: "Jordan Rivers",
  email: "jordan@example.com",
  message: "Hi there — do you take custom commissions for dining tables?",
};

describe("contactSchema", () => {
  it("accepts valid input", () => {
    expect(contactSchema.safeParse(validInput).success).toBe(true);
  });

  it("rejects a name shorter than 2 characters", () => {
    expect(contactSchema.safeParse({ ...validInput, name: "J" }).success).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(contactSchema.safeParse({ ...validInput, email: "not-an-email" }).success).toBe(false);
  });

  it("rejects a message shorter than 10 characters", () => {
    expect(contactSchema.safeParse({ ...validInput, message: "too short" }).success).toBe(false);
  });

  it("rejects a message longer than 2000 characters", () => {
    expect(contactSchema.safeParse({ ...validInput, message: "a".repeat(2001) }).success).toBe(false);
  });
});
