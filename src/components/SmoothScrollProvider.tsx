/**
 * SmoothScrollProvider — Lenis-powered smooth scrolling synchronized with GSAP.
 *
 * Why this exists:
 *   - Native scroll + sticky-pinned sections + scrubbed ScrollTriggers cause
 *     sub-pixel "stair-stepping" on macOS/Chrome. Lenis interpolates the scroll
 *     position on rAF, which removes the stepping and lets ScrollTrigger
 *     receive a smoothly-moving scrollY.
 *   - We drive Lenis from GSAP's ticker so the two run on the exact same
 *     frame and never fight each other.
 *
 * Industry references: this is the same pairing used by Studio Freight (Lenis
 * authors) and the GSAP docs' recommended "scroll smoother" alternative.
 */

"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Respect reduced motion.
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) return;

    const lenis = new Lenis({
      // Tuned for "premium" feel — short ramp-down, no overshoot.
      duration: 1.05,
      // Ease curve from Lenis docs (industry default for smooth pages).
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // Don't run Lenis on touch — native momentum scrolling on mobile is
      // already excellent and Lenis-on-touch fights iOS rubber-banding.
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    // Drive Lenis on GSAP's ticker so both stay frame-locked.
    const tickerCallback = (time: number) => {
      // gsap ticker gives time in seconds; Lenis wants milliseconds.
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    // Disable lag smoothing so heavy frames don't artificially stretch
    // animation deltas (which is what causes the "rubber band catch-up" feel
    // when a scroll-driven timeline is paired with smooth scrolling).
    gsap.ticker.lagSmoothing(0);

    // Tell ScrollTrigger when Lenis scrolls so triggers update on the
    // smoothed value instead of the raw one.
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
