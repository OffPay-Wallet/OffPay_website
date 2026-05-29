/**
 * Global type definitions for the OffPay landing page.
 * All shared interfaces and type aliases live here.
 * Component-specific prop types are co-located in their respective files.
 */

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

export interface NavLink {
  label: string;
  href: string;
}

// ---------------------------------------------------------------------------
// Common primitives
// ---------------------------------------------------------------------------

/** A single feature card. */
export interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  /** Optional path to a visual asset (e.g. 3D render) displayed as the card hero. */
  image?: string;
}

/** A single FAQ item. */
export interface FaqItem {
  question: string;
  answer: string;
}

// ---------------------------------------------------------------------------
// Animation utility
// ---------------------------------------------------------------------------

/** Options accepted by the shared animation utility functions. */
export interface FadeInOptions {
  delay?: number;
  duration?: number;
  y?: number;
  ease?: string;
}
