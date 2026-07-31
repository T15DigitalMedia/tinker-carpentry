import type { NextConfig } from "next";
import path from "path";
import { withSentryConfig } from "@sentry/nextjs";

const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default withSentryConfig(nextConfig, {
  // Source map upload needs SENTRY_ORG / SENTRY_PROJECT / SENTRY_AUTH_TOKEN;
  // silently skipped until those are added (see Phase 7 hardening).
  silent: true,
});
