export const SITE_NAME = "Tinker Carpentry";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined) ??
  "https://tinker-carpentry.vercel.app";

export const SITE_DESCRIPTION = "Handmade carpentry, built and sold by hand.";
