import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["localhost:3000", "offpay.app", "www.offpay.app"],

  // ── Production hardening ──────────────────────────────────────────────
  reactStrictMode: true,
  poweredByHeader: false, // Remove "X-Powered-By: Next.js" header

  // Compress responses with gzip/brotli
  compress: true,

  // Optimize images served via next/image
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.offpay.app",
      },
      {
        protocol: "https",
        hostname: "offpay.app",
      },
    ],
  },

  // Fallback security headers (also set via Edge Middleware)
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-DNS-Prefetch-Control", value: "on" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    },
  ],
};

export default nextConfig;
