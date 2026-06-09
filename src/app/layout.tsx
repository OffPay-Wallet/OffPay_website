import type { Metadata } from "next";
import "./globals.css";
import "lenis/dist/lenis.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/sections/Footer";
import ContentProtection from "@/components/ui/ContentProtection";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import { LoadingProvider } from "@/context/LoadingContext";
import { NAV_LINKS, SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/constants";
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
// Navbar is now self-contained with built-in logo and CTA
// No external props needed - all design is internal
// ---------------------------------------------------------------------------

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
          <ContentProtection />

          <Navbar
            links={NAV_LINKS}
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
