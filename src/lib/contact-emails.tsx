import * as Sentry from "@sentry/nextjs";
import { render } from "@react-email/render";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { SITE_NAME } from "@/lib/site";
import { ContactMessageEmail } from "@/emails/contact-message";
import type { ContactInput } from "@/lib/validation/contact";

const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL!;

export async function sendContactMessageEmail({ name, email, message }: ContactInput) {
  const element = <ContactMessageEmail name={name} email={email} message={message} />;

  try {
    const [html, text] = await Promise.all([render(element), render(element, { plainText: true })]);
    await resend.emails.send({
      from: EMAIL_FROM,
      to: CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `New message from ${name} — ${SITE_NAME}`,
      html,
      text,
    });
    return { ok: true as const };
  } catch (err) {
    Sentry.captureException(err);
    return { ok: false as const };
  }
}
