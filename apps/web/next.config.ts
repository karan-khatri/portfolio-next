import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../.."),
  transpilePackages: ["@portfolio/db", "@portfolio/sections"],
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
  serverExternalPackages: ["sharp"],
  images: {
    // Media uploads go through either LocalDiskStorageAdapter (served
    // same-origin from /uploads/, no remote pattern needed) or
    // VercelBlobStorageAdapter — the latter's URLs live on a per-project
    // subdomain of this shared host.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  async headers() {
    // A nonce-based CSP would be stronger (blocks any injected inline script
    // outright), but requires reading the request's nonce in the root layout,
    // which forces every route to render dynamically per-request instead of
    // being statically prerendered — not a trade worth making for a portfolio
    // site whose whole point is being fast and statically cacheable. This is a
    // static, build-time-fixed policy instead: 'unsafe-inline' allows Next's
    // own hydration scripts (and next-themes' anti-flash script) to run.
    // Real protection still comes from every other directive here, plus the
    // existing sanitize-html allowlist on any user-authored rich text content
    // (no <script>/event-handler attributes are ever permitted through it).
    const scriptSrc =
      process.env.NODE_ENV === "production"
        ? "'self' 'unsafe-inline' https://va.vercel-scripts.com"
        : "'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com";

    // Vercel Analytics/Speed Insights beacon endpoint — same-origin-proxied
    // when actually deployed on Vercel, but the local/preview script still
    // posts here directly.
    const vercelAnalyticsHosts = "https://va.vercel-scripts.com https://vitals.vercel-insights.com";

    const csp = [
      "default-src 'self'",
      `script-src ${scriptSrc}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://*.public.blob.vercel-storage.com",
      "font-src 'self' data:",
      `connect-src 'self' ${vercelAnalyticsHosts}`,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;
