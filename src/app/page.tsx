/**
 * Home page — server component orchestrator.
 *
 * This file's only job is assembling sections in order and passing props.
 * No logic, no styles, no hardcoded strings — everything comes from constants.
 *
 * "use client" is intentionally absent: the page shell is a Server Component.
 * Individual interactive sections declare "use client" in their own files.
 */

// Render at the Vercel Edge Network for lower TTFB worldwide
export const runtime = "edge";

import Hero from "@/components/sections/Hero";
import LayersProviders from "@/components/sections/LayersProviders";
import DemoVideo from "@/components/sections/DemoVideo";
import Features from "@/components/sections/Features";
import HowItWorks from "@/components/sections/HowItWorks";
import Cta from "@/components/sections/Cta";
import Faq from "@/components/sections/Faq";
import GlowButton from "@/components/ui/GlowButton";
import type { Feature } from "@/types";

import {
  HERO_HEADLINE_LINE1,
  HERO_HEADLINE_LINE2,
  HERO_SUBHEADLINE,
  HERO_CTA_PRIMARY,
  FEATURES_LABEL,
  FEATURES_TAGLINE_BOLD,
  FEATURES_TAGLINE_ITALIC,
  HOW_IT_WORKS_HEADLINE,
  PRIVATE_P2P_HEADLINE,
  UMBRA_HEADLINE,
  PRIVATE_SWAP_HEADLINE,
  JUPITER_SWAP_HEADLINE,
  FAQ_HEADLINE,
  FAQ_ITEMS,
} from "@/constants";

// ---------------------------------------------------------------------------
// Feature data — aligned to PRD core differentiators
// ---------------------------------------------------------------------------

const FEATURES: Feature[] = [
  {
    icon: "📡",
    title: "Offline stablecoin slots",
    description:
      "Offline USDC/USDT is signed on-device and settled when connection returns.",
    image: "/3d-assets/no-internet.png",
  },
  {
    icon: "🔐",
    title: "MagicBlock private sends",
    description:
      "MagicBlock prepares private send and settlement transactions for local signing.",
    image: "/3d-assets/money.png",
  },
  {
    icon: "🔒",
    title: "Umbra shielded stablecoins",
    description:
      "Umbra shields balances, withdraws via sanitized backend proxies, and reconciles claimed UTXOs against the on-chain nullifier set.",
    image: "/3d-assets/privacy.png",
  },
  {
    icon: "💲",
    title: "Jupiter swap stack",
    description:
      "Jupiter powers quotes, execution, trigger orders, and recurring swaps.",
    image: "/3d-assets/swap.png",
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Home() {
  return (
    <main>
      <Hero
        headlineLine1={HERO_HEADLINE_LINE1}
        headlineLine2={HERO_HEADLINE_LINE2}
        subheadline={HERO_SUBHEADLINE}
        ctaPrimary={
          <GlowButton
            label={HERO_CTA_PRIMARY}
            variant="primary"
          />
        }
      />

      <LayersProviders />

      <DemoVideo />

      <HowItWorks
        headline={HOW_IT_WORKS_HEADLINE}
        privateHeadline={PRIVATE_P2P_HEADLINE}
        umbraHeadline={UMBRA_HEADLINE}
        swapHeadline={PRIVATE_SWAP_HEADLINE}
        jupiterHeadline={JUPITER_SWAP_HEADLINE}
      />

      <Features
        sectionLabel={FEATURES_LABEL}
        taglineBold={FEATURES_TAGLINE_BOLD}
        taglineItalic={FEATURES_TAGLINE_ITALIC}
        features={FEATURES}
      />

      <Faq headline={FAQ_HEADLINE} items={FAQ_ITEMS} />

      <Cta
        headline="OffPay is coming soon."
        supporting="Send and receive money on Solana, even without internet. Swap tokens, keep your balance private, and stay in full control of your wallet at all times."
        action={
          <span
            className="btn btn-primary"
            style={{ cursor: "default", opacity: 0.85, pointerEvents: "none" }}
          >
            Coming soon
          </span>
        }
      />
    </main>
  );
}
