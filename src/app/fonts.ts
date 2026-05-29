/**
 * Font configuration — all local fonts loaded via next/font/local.
 *
 * Each font exposes a CSS variable so components can reference them via
 * `var(--font-xxx)` in inline styles or through the design system tokens
 * defined in globals.css.
 *
 * Font files live in public/fonts/. Paths are relative to this file.
 */

import localFont from "next/font/local";

/* ------------------------------------------------------------------ */
/* Display / Headline fonts                                            */
/* ------------------------------------------------------------------ */

/** PP Mondwest — dramatic display face for hero headlines */
export const ppMondwest = localFont({
  src: "../../public/fonts/Ppmondwest.woff2",
  variable: "--font-mondwest",
  display: "swap",
  weight: "400",
});

/** PP Migra — elegant serif for accent / secondary headlines */
export const ppMigra = localFont({
  src: "../../public/fonts/PP Migra.woff2",
  variable: "--font-migra",
  display: "swap",
  weight: "400",
});

/** Modernera — clean geometric display */
export const modernera = localFont({
  src: "../../public/fonts/Modernera.woff2",
  variable: "--font-modernera",
  display: "swap",
  weight: "400",
});

/* ------------------------------------------------------------------ */
/* Body / UI fonts                                                     */
/* ------------------------------------------------------------------ */

/** TT Commons — versatile workhorse for body & UI elements */
export const ttCommons = localFont({
  src: "../../public/fonts/TT Commons.woff2",
  variable: "--font-tt-commons",
  display: "swap",
  weight: "400",
});

/** Schibsted Grotesk — crisp grotesk for nav links & labels */
export const schibstedGrotesk = localFont({
  src: "../../public/fonts/Schibstedgrotesk.woff2",
  variable: "--font-schibsted",
  display: "swap",
  weight: "400",
});

/** Bricolage Grotesque — distinctive rounded grotesk */
export const bricolageGrotesque = localFont({
  src: "../../public/fonts/Bricolage Grotesque.woff2",
  variable: "--font-bricolage",
  display: "swap",
  weight: "400",
});

/** PP Fraktion Sans — sharp geometric sans */
export const ppFraktionSans = localFont({
  src: "../../public/fonts/Ppfraktionsans.woff2",
  variable: "--font-fraktion",
  display: "swap",
  weight: "400",
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
