/**
 * Hero — the above-the-fold section.
 *
 * Clean layout: headline, subheadline, single CTA, and phone mockup.
 * Background: static gradient with HalftoneDots texture.
 */

"use client";

import MeshGradient from "@/components/ui/MeshGradient";
import { HeroBadge } from "@/components/ui/HeroBadge";
import { BlurReveal } from "@/components/blur-reveal";
import { useLoading } from "@/context/LoadingContext";

export interface HeroProps {
  headlineLine1: string;
  headlineLine2: string;
  subheadline: React.ReactNode;
  ctaPrimary: React.ReactNode;
  background?: React.ReactNode;
}

export default function Hero({
  headlineLine1,
  headlineLine2,
  subheadline,
  ctaPrimary,
  background,
}: HeroProps) {
  const { isLoaded } = useLoading();

  return (
    <section
      className="hero-section"
      aria-label="Hero"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderRadius: "var(--radius-xl)",
        margin: "8px",
      }}
    >
      {background && (
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          {background}
        </div>
      )}

      <MeshGradient />

      <div
        className="hero-content"
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          padding: "0 var(--section-px)",
          margin: "0 auto",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: "1",
        }}
      >
        {/* Powered By Badge */}
        <div
          className="hero-badge-wrap"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <HeroBadge />
        </div>

        {/* Headline — triggers only after loading screen exits */}
        <h1
          className="hero-headline"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "0",
            margin: 0,
            color: "var(--color-text)",
            textShadow: "0 2px 24px rgba(252, 252, 255, 0.42)",
            textWrap: "balance",
          }}
        >
          <span className="hero-headline__brand">
            <BlurReveal
              as="span"
              trigger={isLoaded}
              speedReveal={1.8}
              speedSegment={0.5}
            >
              {headlineLine1}
            </BlurReveal>
          </span>
          <span className="hero-headline__claim">
            <span className="hero-headline__claim-line">
              <BlurReveal
                as="span"
                trigger={isLoaded}
                delay={0.3}
                speedReveal={1.8}
                speedSegment={0.5}
              >
                {headlineLine2}
              </BlurReveal>
            </span>
          </span>
        </h1>

        {/* Subheadline */}
        <p
          className="hero-subheadline"
          style={{
            fontSize: "clamp(0.85rem, 1.2vw, 0.95rem)",
            fontFamily: "var(--font-heading)",
            color: "var(--color-accent-dark)",
            margin: "0 auto",
            lineHeight: 1.4,
            fontWeight: 700,
            textAlign: "center",
            maxWidth: "660px",
            padding: "0 1rem",
          }}
        >
          {subheadline}
        </p>

        {/* CTA */}
        <div
          className="hero-cta"
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          {ctaPrimary}
        </div>

      </div>
    </section>
  );
}
