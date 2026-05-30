import type { Metadata } from "next";
import "./globals.css";
import "lenis/dist/lenis.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/sections/Footer";
import ContentProtection from "@/components/ui/ContentProtection";
import LoadingScreen from "@/components/ui/LoadingScreen";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import { LoadingProvider } from "@/context/LoadingContext";
import { NAV_LINKS, SITE_NAME, SITE_DESCRIPTION, SITE_URL, HERO_CTA_PRIMARY } from "@/constants";
import { allFontVariables } from "./fonts";



export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
  },
};

// ---------------------------------------------------------------------------
// Stub logo and navbar data — replace in the content pass
// ---------------------------------------------------------------------------

const LOGO_STUB = (
  <span style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "0", color: "var(--color-text)", fontFamily: "var(--font-heading)", display: "flex", alignItems: "center" }}>
    OffPay
  </span>
);

const NAVBAR_CTA_STUB = (
  <span
    style={{
      display: "inline-block",
      padding: "8px 20px",
      fontSize: "14px",
      fontFamily: "var(--font-nav)",
      fontWeight: 500,
      color: "var(--color-text-muted)",
      background: "var(--color-text-inverse)",
      border: "1px solid var(--color-border)",
      borderRadius: "9999px",
      letterSpacing: "0",
      whiteSpace: "nowrap",
      boxShadow: "0 10px 24px rgba(14, 42, 53, 0.14), inset 1px 1px 0 rgba(252, 252, 255, 0.78)",
      cursor: "default",
      opacity: 0.85,
    }}
  >
    Coming soon
  </span>
);

// ---------------------------------------------------------------------------
// Root layout
// ---------------------------------------------------------------------------

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={allFontVariables}
    >
      <body>
        <LoadingProvider>
          <LoadingScreen />
          <ContentProtection />

          <Navbar
            logo={LOGO_STUB}
            links={NAV_LINKS}
            cta={NAVBAR_CTA_STUB}
          />

          <SmoothScrollProvider>
            {children}

            <Footer />
          </SmoothScrollProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
