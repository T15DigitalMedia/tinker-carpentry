import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY!);

// "Name <address>" — must be on a domain verified in the Resend dashboard.
export const EMAIL_FROM = process.env.RESEND_FROM_EMAIL!;
