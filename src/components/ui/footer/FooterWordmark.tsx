/**
 * FooterWordmark — oversized brand name spanning full width.
 *
 * Renders the large "OffPay" text that dominates the bottom
 * portion of the footer. Uses PP Migra at a massive size.
 * SlideUpText animation triggers on scroll into view.
 */

"use client";

import { SlideUpText } from "@/components/slide-up-text";

export default function FooterWordmark() {
  return (
    <div
      className="footer-wordmark"
      aria-hidden="true"
      style={{
        lineHeight: 1.1,
        padding: "2rem 0 4vw",
        textAlign: "center",
      }}
    >
      <SlideUpText
        split="characters"
        inView
        once
        stagger={0.05}
        className="footer-wordmark__text"
      >
        OffPay
      </SlideUpText>
    </div>
  );
}
