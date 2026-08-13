"use server";

import { contactSchema } from "@/lib/validation/contact";
import { sendContactMessageEmail } from "@/lib/contact-emails";

// Below this, a submission is almost certainly a bot filling the form
// faster than a human could read it.
const MIN_SUBMIT_MS = 3000;

export type ContactState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof typeof contactSchema.shape, string[]>>;
  success?: boolean;
} | undefined;

export async function submitContactAction(
  _prevState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot field: real visitors never see or fill it. A bot that does gets
  // a fake success so it doesn't learn to route around the check.
  if (formData.get("company")) {
    return { success: true };
  }

  const startedAt = Number(formData.get("startedAt"));
  if (Number.isFinite(startedAt) && Date.now() - startedAt < MIN_SUBMIT_MS) {
    return { success: true };
  }

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const result = await sendContactMessageEmail(parsed.data);
  if (!result.ok) {
    return { error: "Something went wrong sending your message — please try again or email us directly." };
  }

  return { success: true };
}
