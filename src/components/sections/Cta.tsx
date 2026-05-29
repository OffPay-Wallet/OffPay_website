/**
 * Cta — Dual-tone call-to-action section.
 *
 * Vertical split: white glass left (text + store buttons) | cyan right (phone mockup).
 * Cyan side has HalftoneDots paper texture; white side has grain noise.
 * Mockup sits flush to the bottom with no gap.
 */

"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { HalftoneDots } from "@paper-design/shaders-react";
import { animateScrollFadeIn, prefersReducedMotion } from "@/utils/animation";

export interface CtaProps {
  headline: string;
  supporting: string;
  action: React.ReactNode;
}

/* Store button shared styles */
const storeBtnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  background: "rgba(252, 252, 255, 0.78)",
  backdropFilter: "blur(4px)",
  color: "var(--color-text)",
  borderRadius: "12px",
  padding: "0.6rem 1.1rem",
  textDecoration: "none",
  fontSize: "0.85rem",
  fontWeight: 600,
  fontFamily: "var(--font-body)",
  transition: "background 0.2s ease, border-color 0.2s ease",
  whiteSpace: "nowrap" as const,
  lineHeight: 1.3,
  border: "1px solid var(--color-border)",
  boxShadow: "inset 1px 1px 0 rgba(252, 252, 255, 0.78)",
  cursor: "not-allowed",
  opacity: 0.85,
};

const storeIconStyle: React.CSSProperties = {
  flexShrink: 0,
  display: "block",
  width: "20px",
  height: "20px",
};

export default function Cta({ headline, supporting, action }: CtaProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    // Reduced-motion path: skip the GSAP fade entirely so the content is
    // visible immediately (also avoids the "stuck at opacity 0" risk).
    if (prefersReducedMotion()) {
      content.style.opacity = "1";
      return;
    }

    tweenRef.current = animateScrollFadeIn(content, {
      triggerElement: sectionRef.current,
      y: 30,
    });

    return () => {
      tweenRef.current?.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="waitlist"
      aria-labelledby="cta-heading"
      className="section-spacing adaptive-section"
    >
      <div className="cta-card">
        {/* ── White left background ──────────────────────────── */}
        <div className="cta-card__white" aria-hidden="true">
          <svg style={{ position: "absolute", width: 0, height: 0 }}>
            <filter id="cta-grain">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
          </svg>
          <div className="cta-card__grain" />
        </div>

        {/* ── Cyan right background ─────────────────────────── */}
        <div className="cta-card__blue" aria-hidden="true">
          <div className="cta-card__blue-texture">
            <HalftoneDots
              style={{ width: "100%", height: "100%" }}
              colorBack="#DFF7FA"
              colorFront="#5BC8E8"
              originalColors={false}
              type="gooey"
              grid="hex"
              inverted={false}
              size={0.4}
              radius={1.2}
              contrast={0.3}
              grainMixer={0.15}
              grainOverlay={0.15}
              grainSize={0.4}
            />
          </div>
        </div>

        {/* ── Content ────────────────────────────────────────── */}
        <div ref={contentRef} className="cta-card__content" style={{ opacity: 0 }}>
          {/* Left — text + buttons */}
          <div className="cta-card__text">
            <h2 id="cta-heading" className="cta-card__headline">
              {headline}
            </h2>
            <p className="cta-card__supporting">{supporting}</p>

            {/* Primary CTA */}
            <div className="cta-card__actions">{action}</div>

            {/* Store buttons */}
            <div className="cta-card__stores">
              <button
                type="button"
                disabled
                aria-label="App Store coming soon"
                style={storeBtnStyle}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" style={storeIconStyle}>
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
                  <span style={{ fontSize: "0.55rem", fontWeight: 400, opacity: 0.6 }}>Coming soon</span>
                  <span>App Store</span>
                </span>
              </button>

              <button
                type="button"
                disabled
                aria-label="Google Play coming soon"
                style={storeBtnStyle}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" style={storeIconStyle}>
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 0 1 0 1.38l-2.302 2.302L15.396 12l2.302-2.492zM5.864 3.458L16.8 9.79l-2.302 2.302L5.864 3.458z" />
                </svg>
                <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
                  <span style={{ fontSize: "0.55rem", fontWeight: 400, opacity: 0.6 }}>Coming soon</span>
                  <span>Google Play</span>
                </span>
              </button>
            </div>
          </div>

          {/* Right — phone mockup */}
          <div className="cta-card__mockup">
            <Image
              src="/mockups/cta-mock.webp"
              alt="OffPay wallet app preview"
              width={817}
              height={1025}
              style={{ width: "100%", height: "auto" }}
              className="cta-card__mockup-image protected-image"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
