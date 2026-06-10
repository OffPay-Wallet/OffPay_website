import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Edge Middleware — runs at the CDN edge on every matched request.
//
// Responsibilities:
//   1. Inject security headers on every response
//   2. Log geo information for analytics (extensible for geo-redirect)
//   3. Provide a fast-path for bot/crawler requests
// ---------------------------------------------------------------------------

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // ---------------------------
  // 1. Security Headers
  // ---------------------------
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  // Content-Security-Policy
  // Enable unsafe-eval and websocket connections in development for Next.js hot reload (Fast Refresh)
  const isDev = process.env.NODE_ENV === "development";
  const scriptSrc = isDev 
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" 
    : "script-src 'self' 'unsafe-inline'";
  const connectSrc = isDev
    ? "connect-src 'self' ws: wss: http://localhost:* https://localhost:* http://127.0.0.1:* https://127.0.0.1:* https://www.offpay.app https://offpay.app https://vitals.vercel-insights.com"
    : "connect-src 'self' https://www.offpay.app https://offpay.app https://vitals.vercel-insights.com";

  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob: https:",
      connectSrc,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      ...(isDev ? [] : ["upgrade-insecure-requests"]),
    ].join("; ")
  );

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
// Matcher — skip middleware for static assets and internal Next.js routes
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
