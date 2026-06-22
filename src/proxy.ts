import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Proxy — runs on every matched request.
//
// Responsibilities:
//   1. Inject security headers on every response
//   2. Strip legacy internal subrequest headers from inbound traffic
//   3. Log geo information for analytics (extensible for geo-redirect)
// ---------------------------------------------------------------------------

export function proxy(request: NextRequest) {
  const isDev = process.env.NODE_ENV === "development";
  const nonce = Buffer.from(randomUUID()).toString("base64");

  // Content-Security-Policy
  // Enable unsafe-eval and websocket connections in development for Next.js hot reload.
  const scriptSrc = [
    "script-src",
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    ...(isDev ? ["'unsafe-eval'", "http:", "https:"] : []),
  ].join(" ");
  const connectSrc = isDev
    ? "connect-src 'self' ws: wss: http://localhost:* https://localhost:* http://127.0.0.1:* https://127.0.0.1:* https://www.offpay.app https://offpay.app https://vitals.vercel-insights.com"
    : "connect-src 'self' https://www.offpay.app https://offpay.app https://vitals.vercel-insights.com";

  const contentSecurityPolicy = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: https:",
    connectSrc,
    "worker-src 'self' blob:",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "manifest-src 'self'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");

  const requestHeaders = new Headers(request.headers);

  requestHeaders.delete("x-middleware-subrequest");
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // ---------------------------
  // 1. Security Headers
  // ---------------------------
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  response.headers.set("Origin-Agent-Cluster", "?1");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  response.headers.set("Content-Security-Policy", contentSecurityPolicy);

  // ---------------------------
  // 2. Geo Information (via Vercel edge headers, for future use / analytics)
  // ---------------------------
  const country = request.headers.get("x-vercel-ip-country");
  const city = request.headers.get("x-vercel-ip-city");

  if (country) {
    response.headers.set("X-Geo-Country", country);
  }
  if (city) {
    response.headers.set("X-Geo-City", city);
  }

  return response;
}

// ---------------------------------------------------------------------------
// Matcher — skip proxy for static assets and internal Next.js routes
// to avoid unnecessary processing overhead on asset requests.
// ---------------------------------------------------------------------------
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - Public static assets (fonts, images, videos, etc.)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|fonts/|3d-assets/|logo/|mockups/|video/|node_icons/|color-palette/|app-icons/|\\.well-known/).*)",
  ],
};
