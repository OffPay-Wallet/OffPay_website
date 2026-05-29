


"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HalftoneDots } from "@paper-design/shaders-react";
import { BlurReveal } from "@/components/blur-reveal";
import type { Feature } from "@/types";

gsap.registerPlugin(ScrollTrigger);

// Feature animation storyboard:
// 0ms: section reaches the ScrollTrigger start point
// 0-650ms: product mockup fades/slides into place
// 260-820ms: feature cards reveal with a compact stagger
// Hover/press: Framer Motion lifts the card surface only
const FEATURE_REVEAL_TIMING = {
  y: 28,
  mockupDuration: 0.65,
  cardDuration: 0.46,
  cardStagger: 0.08,
  cardOverlap: "-=0.36",
} as const;

const FEATURE_CARD_MOTION = {
  rest: { y: 0, scale: 1 },
  hover: { y: -4, scale: 1.015 },
  tap: { y: -1, scale: 0.995 },
} as const;

const FEATURE_CARD_TRANSITION = {
  type: "spring",
  stiffness: 360,
  damping: 30,
  mass: 0.7,
} as const;

export interface FeaturesProps {
  sectionLabel?: string;
  taglineBold?: string;
  taglineItalic?: string;
  features: Feature[];
}

export default function Features({
  sectionLabel,
  taglineBold,
  taglineItalic,
  features,
}: FeaturesProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const cardInteractionProps = shouldReduceMotion
    ? {}
    : {
        whileHover: "hover" as const,
        whileTap: "tap" as const,
      };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const mockup = section.querySelector<HTMLElement>("[data-feature-mockup]");
    const cards = section.querySelectorAll<HTMLElement>("[data-feature-card]");

    const revealItems = [mockup, ...Array.from(cards)].filter(Boolean) as HTMLElement[];

    // Reduced motion: skip the timeline entirely and reveal immediately.
    if (shouldReduceMotion) {
      gsap.set(revealItems, { autoAlpha: 1, y: 0, clearProps: "opacity" });
      return;
    }

    gsap.set(revealItems, {
      autoAlpha: 0,
      y: FEATURE_REVEAL_TIMING.y,
    });

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 85%",
        // Failsafe: if the user is already past the trigger when the page
        // mounts (e.g. via in-page anchor), play immediately instead of
        // staying invisible.
        toggleActions: "play none none none",
      },
    });

    if (mockup) {
      timeline.to(mockup, {
        autoAlpha: 1,
        y: 0,
        duration: FEATURE_REVEAL_TIMING.mockupDuration,
        ease: "power3.out",
      });
    }

    timeline.to(
      cards,
      {
        autoAlpha: 1,
        y: 0,
        duration: FEATURE_REVEAL_TIMING.cardDuration,
        stagger: FEATURE_REVEAL_TIMING.cardStagger,
        ease: "power3.out",
      },
      mockup ? FEATURE_REVEAL_TIMING.cardOverlap : 0
    );

    return () => {
      timeline.scrollTrigger?.kill();
      timeline.kill();
    };
  }, [shouldReduceMotion]);

  return (
    <section
      ref={sectionRef}
      id="features"
      aria-labelledby="features-heading"
      className="section-spacing adaptive-section"
    >
      <div className="section-container">
        {/* Header — only the big title */}
        <div className="features-header">
          <h2 id="features-heading" className="features-heading">
            <BlurReveal
              as="span"
              inView
              once
              speedReveal={2}
              speedSegment={0.6}
            >
              {`${taglineBold ?? ""}${taglineItalic ? ` ${taglineItalic}` : ""}`.trim() ||
                sectionLabel ||
                "Features"}
            </BlurReveal>
          </h2>
        </div>

        {/* Bento card — mockup left + 2×2 feature cards right */}
        <div className="features-card">
          <div className="features-card__texture" aria-hidden="true">
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

          <div className="features-card__content">
            <div className="features-layout">
              {/* Mockup — left */}
              <div
                data-feature-mockup
                className="features-mockup-shell"
                style={{ opacity: 0 }}
              >
                <div className="features-mockup">
                  <div className="features-mockup__inner">
                    <Image
                      src="/mockups/feat-mock.webp"
                      alt="OffPay app preview"
                      width={360}
                      height={780}
                      className="features-mockup__image"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* 2×2 feature cards — right */}
              <div className="features-cards">
                {features.map((feature, i) => (
                  <div
                    key={feature.title}
                    data-feature-card
                    className="feature-card-shell"
                    style={{ opacity: 0 }}
                  >
                    <motion.article
                      className="feature-card"
                      initial="rest"
                      {...cardInteractionProps}
                      variants={FEATURE_CARD_MOTION}
                      transition={FEATURE_CARD_TRANSITION}
                  >
                      <div className="feature-card__gradient" aria-hidden="true" />

                      <div className="feature-card__texture" aria-hidden="true">
                        <HalftoneDots
                          style={{ width: "100%", height: "100%" }}
                          colorBack="#F7FEFF"
                          colorFront="#31C6EA"
                          originalColors={false}
                          type="gooey"
                          grid="hex"
                          inverted={false}
                          size={0.34}
                          radius={1.35}
                          contrast={0.42}
                          grainMixer={0.12}
                          grainOverlay={0.1}
                          grainSize={0.35}
                        />
                      </div>

                      <div className="feature-card__content">
                        {feature.image && (
                          <div className="feature-card__image">
                            <Image
                              src={feature.image}
                              alt={feature.title}
                              width={112}
                              height={112}
                              style={{ width: "100%", height: "100%", objectFit: "contain" }}
                              priority={i === 0}
                            />
                          </div>
                        )}
                        <div className="feature-card__copy">
                          <h3 className="feature-card__title">{feature.title}</h3>
                          <p className="feature-card__desc">{feature.description}</p>
                        </div>
                      </div>
                    </motion.article>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
