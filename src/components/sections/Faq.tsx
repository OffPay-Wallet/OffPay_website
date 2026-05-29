/**
 * Faq — Frequently Asked Questions accordion section.
 *
 * Each row is a liquid-glass pill card with glassmorphism.
 * Uses × (close) and + (open) icons in circular buttons.
 * HalftoneDots paper texture on the outer card.
 */

"use client";

import { useState, useRef, useEffect, useId } from "react";
import { HalftoneDots } from "@paper-design/shaders-react";
import ClickSpark from "@/components/ui/ClickSpark";
import { animateScrollFadeIn } from "@/utils/animation";
import type { FaqItem } from "@/types";

export interface FaqProps {
  headline: string;
  items: FaqItem[];
}

interface AccordionItemProps {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({ item, isOpen, onToggle }: AccordionItemProps) {
  const id = useId();
  const panelId = `faq-panel-${id}`;
  const triggerId = `faq-trigger-${id}`;

  return (
    <div
      data-faq-item
      className={`faq-row ${isOpen ? "faq-row--open" : ""}`}
      style={{ opacity: 0 }}
    >
      <h3 style={{ margin: 0 }}>
        <button
          id={triggerId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="faq-row__trigger"
        >
          <span className="faq-row__question">{item.question}</span>
          <span className="faq-row__icon" aria-hidden="true">
            {isOpen ? "×" : "+"}
          </span>
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        className="accordion-panel"
        data-open={isOpen ? "true" : "false"}
      >
        <div className="accordion-panel-inner">
          <p className="faq-row__answer">{item.answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function Faq({ headline, items }: FaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const tweensRef = useRef<gsap.core.Tween[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const faqItems = section.querySelectorAll<HTMLElement>("[data-faq-item]");
    const tweens: gsap.core.Tween[] = [];
    faqItems.forEach((el, i) => {
      tweens.push(
        animateScrollFadeIn(el, {
          triggerElement: el,
          delay: i * 0.03,
          duration: 0.4,
          y: 20,
        })
      );
    });
    tweensRef.current = tweens;

    return () => {
      tweensRef.current.forEach((t) => t.kill());
      tweensRef.current = [];
    };
  }, []);

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section
      ref={sectionRef}
      id="faq"
      aria-labelledby="faq-heading"
      className="section-spacing adaptive-section"
    >
      <ClickSpark
        sparkColor="#5BC8E8"
        sparkSize={10}
        sparkRadius={15}
        sparkCount={8}
        duration={400}
      >
        <div className="faq-card">
          {/* HalftoneDots paper texture overlay */}
          <div className="faq-card__texture" aria-hidden="true">
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

          {/* Content */}
          <div className="faq-card__content">
            <div className="section-header">
              <h2 id="faq-heading">{headline}</h2>
            </div>

            <div className="faq-list">
              {items.map((item, i) => (
                <AccordionItem
                  key={i}
                  item={item}
                  isOpen={openIndex === i}
                  onToggle={() => handleToggle(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </ClickSpark>
    </section>
  );
}
