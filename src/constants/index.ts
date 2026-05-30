/**
 * Site-wide constants.
 * All hardcoded strings, numbers, and configuration values belong here.
 * Components import from this file — never hardcode values inside components.
 */

import type { NavLink, FaqItem } from "@/types";

// ---------------------------------------------------------------------------
// Site metadata
// ---------------------------------------------------------------------------

export const SITE_NAME = "OffPay Wallet" as const;
export const SITE_TAGLINE = "Self-custody payments for online and offline Solana." as const;
export const SITE_DESCRIPTION =
  "OffPay is a non-custodial Solana wallet for offline USDC/USDT durable-nonce payments, MagicBlock private sends, Jupiter swaps, Umbra shielded stablecoin actions, and backend-gated wallet data." as const;
export const SITE_EMAIL = "hello@offpay.app" as const;
export const SITE_URL = "https://offpay.com" as const;

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

export const NAV_LINKS: NavLink[] = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

export const HERO_HEADLINE_LINE1 = "Private payments." as const;
export const HERO_HEADLINE_LINE2 = "Shielded balances. Offline payments." as const;
export const HERO_SUBHEADLINE =
  "Private payments, offline transfers, Jupiter swaps, and Umbra shielded balances — all in one wallet." as const;
export const HERO_CTA_PRIMARY = "Coming soon" as const;

/** Release/download page. All download CTAs across the site route here. */
export const DOWNLOAD_APK_URL = "https://github.com/ikarn-dev/offpay/releases/tag/v1.0" as const;

// ---------------------------------------------------------------------------
// Features
// ---------------------------------------------------------------------------

export const FEATURES_LABEL = "Features" as const;
export const FEATURES_TAGLINE_BOLD = "What the app actually does," as const;
export const FEATURES_TAGLINE_ITALIC = "" as const;

// ---------------------------------------------------------------------------
// How It Works
// ---------------------------------------------------------------------------

export const HOW_IT_WORKS_HEADLINE = "Offline USDC/USDT payment flow" as const;
export const PRIVATE_P2P_HEADLINE = "Private stablecoin sends" as const;
export const UMBRA_HEADLINE = "Umbra shielded stablecoins" as const;
export const PRIVATE_SWAP_HEADLINE = "Privacy-envelope swaps" as const;
export const JUPITER_SWAP_HEADLINE = "Jupiter swap and order flows" as const;

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

export const FAQ_HEADLINE = "Frequently asked questions" as const;

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "How do offline payments work without internet?",
    answer:
      "The app prepares durable nonce payment slots while online. In offline mode it builds and signs a stablecoin transfer locally, shares the request or signed payload by QR or nearby BLE, encrypts the pending transaction, and settles it when connectivity returns.",
  },
  {
    question: "Do offline and private payments work with every token?",
    answer:
      "No. The implemented private and offline P2P layer is stablecoin-only: USDC or USDT. SOL is reserved for network fees. Jupiter swaps can use supported swap tokens when the swap capability is available.",
  },
  {
    question: "What does OffPay verify before signing?",
    answer:
      "The client verifies route-specific transaction details before signing. Offline payments verify nonceAdvance first, signer, recipient, amount, token, and signatures. Private sends verify signer, mint, amount, recipient, and private-route metadata.",
  },
  {
    question: "Who holds my funds?",
    answer:
      "You do. Wallet secrets stay in device storage and are gated by local passcode or biometrics when enabled. OffPay never has access to your funds or private keys.",
  },
  {
    question: "Does the mobile app call Helius, Jupiter, MagicBlock, or QuickNode directly?",
    answer:
      "No. The client uses https://api.offpay.app for authenticated API calls, RPC proxying, wallet data, risk, swaps, private payments, pending backups, capabilities, and settlement. Provider credentials stay server-side.",
  },
  {
    question: "What happens if a private or offline payment cannot submit right away?",
    answer:
      "The signed transaction blob is encrypted into the pending backup queue. Private-send retryable failures can upload the backup immediately; offline handoffs keep the queue local until reconnect. The settlement engine retries and clears confirmed items.",
  },
  {
    question: "Where does Umbra fit?",
    answer:
      "Umbra powers supported shielded stablecoin actions in the client: register the encrypted-balance account, query supported shielded balances, shield, and withdraw. Pending UTXO scans now reconcile against the on-chain Umbra nullifier-set accounts so claimed UTXOs stay hidden even after a cold boot or reinstall. Signing, key material, and proof/decryption state stay client-side.",
  },
  {
    question: "Can OffPay work manually offline forever?",
    answer:
      "No. Offline payment setup requires an online preparation step, and settlement requires reconnecting. Manual offline mode intentionally blocks backend and network requests.",
  },
];

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

export const FOOTER_COPYRIGHT_YEAR = 2026 as const;

export const FOOTER_EMAIL = "hello@offpay.app" as const;
export const FOOTER_CTA_HEADING = "Coming soon" as const;

export const FOOTER_SOCIAL_LABELS = ["Twitter / X", "GitHub"] as const;

// ---------------------------------------------------------------------------
// Animation defaults (consumed by the animation utility — do not use directly)
// ---------------------------------------------------------------------------

export const ANIM_DEFAULTS = {
  duration: 0.7,
  ease: "power3.out",
  stagger: 0.1,
  yOffset: 40,
} as const;

// ---------------------------------------------------------------------------
// Scroll utility
// ---------------------------------------------------------------------------

/** Minimum delta (px) before a direction change is reported. */
export const SCROLL_DIRECTION_THRESHOLD = 4 as const;
