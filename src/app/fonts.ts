/**
 * Font configuration — now using Google Fonts as fallback since local files are missing.
 *
 * Each font exposes a CSS variable so components can reference them via
 * `var(--font-xxx)` in inline styles or through the design system tokens
 * defined in globals.css.
 */

import { Inter, Bricolage_Grotesque, Schibsted_Grotesk, Space_Grotesk, Playfair_Display } from "next/font/google";

/* ------------------------------------------------------------------ */
/* Display / Headline fonts                                            */
/* ------------------------------------------------------------------ */

export const ppMondwest = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-mondwest",
  display: "swap",
});

export const ppMigra = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-migra",
  display: "swap",
});

export const modernera = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-modernera",
  display: "swap",
});

/* ------------------------------------------------------------------ */
/* Body / UI fonts                                                     */
/* ------------------------------------------------------------------ */

export const ttCommons = Inter({
  subsets: ["latin"],
  variable: "--font-tt-commons",
  display: "swap",
});

export const schibstedGrotesk = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-schibsted",
  display: "swap",
});

export const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

export const ppFraktionSans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-fraktion",
  display: "swap",
});

/* ------------------------------------------------------------------ */
/* Combined class string — apply to <html> to activate all variables   */
/* ------------------------------------------------------------------ */

export const allFontVariables = [
  ppMondwest.variable,
  ppMigra.variable,
  modernera.variable,
  ttCommons.variable,
  schibstedGrotesk.variable,
  bricolageGrotesque.variable,
  ppFraktionSans.variable,
].join(" ");
