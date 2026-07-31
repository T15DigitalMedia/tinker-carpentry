import type { NextConfig } from "next";
import path from "path";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
};

export default withSentryConfig(nextConfig, {
  // Source map upload needs SENTRY_ORG / SENTRY_PROJECT / SENTRY_AUTH_TOKEN;
  // silently skipped until those are added (see Phase 7 hardening).
  silent: true,
});
