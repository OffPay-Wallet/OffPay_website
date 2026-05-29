/**
 * Shared GSAP helpers for scroll-driven landing page sections.
 *
 * Every returned Tween / Timeline must be cleaned up by the caller
 * (call .kill() inside the useEffect cleanup or React.useRef teardown).
 * Avoid animating layout properties (width, height, top, left, padding, ...).
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ANIM_DEFAULTS } from "@/constants";
import type { FadeInOptions } from "@/types";

// ---------------------------------------------------------------------------
// Plugin registration — run once at module level (safe for SSR: ScrollTrigger
// checks for window internally and no-ops during the server render pass).
// ---------------------------------------------------------------------------

gsap.registerPlugin(ScrollTrigger);

// ---------------------------------------------------------------------------
// Re-export the gsap core and ScrollTrigger so callers can use type helpers
// (e.g. gsap.core.Timeline) without importing gsap themselves.
// ---------------------------------------------------------------------------

export type { gsap };
export { ScrollTrigger };

/**
 * Fade an element in when it enters the viewport (ScrollTrigger).
 * Returns the tween. The ScrollTrigger instance is automatically linked to the
 * tween — killing the tween also kills its ScrollTrigger.
 */
export function animateScrollFadeIn(
  target: gsap.TweenTarget,
  options: FadeInOptions & { triggerElement?: Element | null } = {}
): gsap.core.Tween {
  const {
    delay = 0,
    duration = ANIM_DEFAULTS.duration,
    y = ANIM_DEFAULTS.yOffset,
    ease = ANIM_DEFAULTS.ease,
    triggerElement,
  } = options;

  // Resolve the trigger element; fall back to the animation target itself.
  // We must not pass `undefined` to ScrollTrigger.trigger when
  // exactOptionalPropertyTypes is enabled, so we conditionally build the config.
  const resolvedTrigger: Element | null =
    triggerElement !== undefined ? triggerElement : (target as Element | null);

  const scrollTriggerConfig = resolvedTrigger
    ? {
      trigger: resolvedTrigger,
      start: "top 85%" as const,
      toggleActions: "play none none none" as const,
    }
    : {
      start: "top 85%" as const,
      toggleActions: "play none none none" as const,
    };

  return gsap.fromTo(
    target,
    { opacity: 0, y },
    {
      opacity: 1,
      y: 0,
      duration,
      delay,
      ease,
      scrollTrigger: scrollTriggerConfig,
    }
  );
}

/**
 * Generic N-slide horizontal track swap — scroll-driven.
 * Evenly divides the scroll distance into (N-1) transitions.
 * Track translates: 0% → -(100/N)% → -(200/N)% → … → -((N-1)*100/N)%
 *
 * `onSlideChange` is called with the active slide index when it changes.
 * The callback runs at most once per slide transition (not per scroll
 * frame), so it's safe to use it to trigger React state updates without
 * causing scroll jank.
 */
export function animateHorizontalTrackSwapN({
  triggerElement,
  track,
  titles,
  start = "top top",
  end = "bottom bottom",
  scrub = 0.6,
  onSlideChange,
}: {
  triggerElement: Element;
  track: Element;
  titles: gsap.TweenTarget[];
  start?: string;
  end?: string;
  scrub?: number;
  onSlideChange?: (index: number) => void;
}): () => void {
  const media = gsap.matchMedia();
  const slideCount = titles.length;
  const transitionCount = slideCount - 1;

  media.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
    const progress = { value: 0 };

    // Each transition gets an equal share of scroll, with breathing room at edges
    const edgePad = 0.12;
    const usable = 1 - edgePad * 2;
    const slideDuration = usable / (transitionCount + 0.5);
    const titleDuration = slideDuration * 0.28;
    const stepPercent = 100 / slideCount;

    // Pre-compute the midpoint thresholds for slide-change detection so we
    // don't recompute them on every scroll frame.
    const midpoints: number[] = [];
    for (let i = 0; i < transitionCount; i++) {
      midpoints.push(edgePad + (i + 0.5) * slideDuration + i * (slideDuration * 0.15));
    }

    gsap.set(track, { xPercent: 0, force3D: true });
    titles.forEach((title, i) => {
      gsap.set(title, { autoAlpha: i === 0 ? 1 : 0, yPercent: i === 0 ? 0 : 12 });
    });

    let currentSlide = 0;

    const baseScrollTrigger = {
      trigger: triggerElement,
      start,
      end,
      scrub,
      invalidateOnRefresh: true,
      // Ensure ScrollTrigger refreshes when fonts swap or images load
      // (otherwise pin distances drift and the track jitters at boundaries).
      anticipatePin: 1,
    } as const;

    const onUpdateCallback = onSlideChange
      ? (self: ScrollTrigger) => {
          const p = self.progress;
          let newSlide = 0;
          for (let i = 0; i < transitionCount; i++) {
            if (p > midpoints[i]) newSlide = i + 1;
          }
          if (newSlide !== currentSlide) {
            currentSlide = newSlide;
            onSlideChange(newSlide);
          }
        }
      : null;

    const timeline = gsap.timeline({
      scrollTrigger: onUpdateCallback
        ? { ...baseScrollTrigger, onUpdate: onUpdateCallback }
        : baseScrollTrigger,
    });

    timeline.to(progress, { value: 1, duration: 1, ease: "none" }, 0);

    for (let i = 0; i < transitionCount; i++) {
      const tStart = edgePad + i * slideDuration + i * (slideDuration * 0.15);
      const tTitleOut = tStart + slideDuration * 0.48;
      const tTitleIn = tTitleOut + titleDuration;
      const targetX = -(i + 1) * stepPercent;

      timeline
        .to(track, { xPercent: targetX, duration: slideDuration, ease: "none" }, tStart)
        .to(titles[i], { autoAlpha: 0, yPercent: -12, duration: titleDuration, ease: "none" }, tTitleOut)
        .to(titles[i + 1], { autoAlpha: 1, yPercent: 0, duration: titleDuration, ease: "none" }, tTitleIn);
    }

    return () => {
      timeline.kill();
    };
  });

  media.add("(max-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
    const slides = Array.from(track.children).slice(0, slideCount);
    const cards = slides.map(
      (slide) => slide.querySelector(".hiw-mockup-card") ?? slide
    );
    const triggers: ScrollTrigger[] = [];
    const animations: gsap.core.Tween[] = [];
    let frame = 0;
    let currentSlide = -1;

    gsap.set(track, { clearProps: "transform" });
    titles.forEach((title, i) => {
      gsap.set(title, { autoAlpha: i === 0 ? 1 : 0, yPercent: i === 0 ? 0 : 10 });
    });
    slides.forEach((slide, i) => {
      gsap.set(slide, {
        autoAlpha: 1,
        scale: 1,
        yPercent: 0,
        zIndex: i + 1,
        transformOrigin: "center top",
      });
    });
    gsap.set(cards, {
      autoAlpha: 1,
      scale: 1,
      yPercent: 0,
      transformOrigin: "center top",
    });

    const activateSlide = (index: number) => {
      if (index === currentSlide) return;
      currentSlide = index;
      onSlideChange?.(index);

      titles.forEach((title, i) => {
        gsap.to(title, {
          autoAlpha: i === index ? 1 : 0,
          yPercent: i === index ? 0 : i < index ? -10 : 10,
          duration: 0.24,
          ease: "power2.out",
          overwrite: "auto",
        });
      });
    };

    const syncActiveSlide = () => {
      const pivot = window.innerHeight * 0.46;
      const nextSlide = slides.reduce((activeIndex, slide, index) => {
        const top = slide.getBoundingClientRect().top;
        return top <= pivot ? index : activeIndex;
      }, 0);

      activateSlide(nextSlide);
    };

    triggers.push(
      ScrollTrigger.create({
        trigger: triggerElement,
        start: "top bottom",
        end: "bottom top",
        invalidateOnRefresh: true,
        onEnter: syncActiveSlide,
        onEnterBack: syncActiveSlide,
        onRefresh: syncActiveSlide,
        onUpdate: syncActiveSlide,
      })
    );

    frame = requestAnimationFrame(syncActiveSlide);

    cards.slice(0, -1).forEach((card, index) => {
      const nextSlide = slides[index + 1];
      if (!nextSlide) return;

      // Parallax "stacked card" out — previous card recedes behind the
      // incoming one. Industry pattern (Apple/Linear): keep the back card
      // partially visible for depth; scale + lift; never fully fade.
      // Each successive card recedes a bit further so the stack reads as
      // layered z-depth, not a stack of equally-hidden ghosts.
      const targetScale = Math.max(0.88, 0.95 - index * 0.012);
      const targetYPercent = -3 - index * 0.6;

      animations.push(
        gsap.to(card, {
          autoAlpha: 0.32,
          scale: targetScale,
          yPercent: targetYPercent,
          filter: "blur(2px)",
          ease: "power1.out",
          scrollTrigger: {
            trigger: nextSlide,
            start: "top 92%",
            end: "top 30%",
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        })
      );
    });

    // Parallax "stacked card" in — incoming card rises from a small
    // offset and settles. The scrub here is shorter than the receding
    // tween so the incoming card finishes locking-in slightly before
    // the previous one is fully recessed (creates a perceptible
    // "card lands on top" beat).
    cards.slice(1).forEach((card, idx) => {
      const slide = slides[idx + 1];
      if (!slide) return;

      animations.push(
        gsap.fromTo(
          card,
          { yPercent: 6, scale: 0.985, autoAlpha: 0.92 },
          {
            yPercent: 0,
            scale: 1,
            autoAlpha: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: slide,
              start: "top 88%",
              end: "top 55%",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          }
        )
      );
    });

    // Release the sticky title with the last slide. Without this, the
    // title-layer container has just enough trailing height to remain
    // pinned for a beat after the last card has scrolled away — visible
    // as a "title hovering above empty space" glitch on mobile.
    const titleLayerEl =
      (titles[0] as HTMLElement | null)?.parentElement ?? null;
    const lastSlide = slides[slides.length - 1] as HTMLElement | undefined;
    if (titleLayerEl && lastSlide) {
      animations.push(
        gsap.to(titleLayerEl, {
          autoAlpha: 0,
          ease: "power1.out",
          scrollTrigger: {
            trigger: lastSlide,
            start: "bottom 80%",
            end: "bottom 50%",
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        })
      );
    }

    return () => {
      cancelAnimationFrame(frame);
      triggers.forEach((trigger) => trigger.kill());
      animations.forEach((animation) => animation.kill());
      gsap.killTweensOf(titles);
      const cleanupTargets: gsap.TweenTarget[] = [track, ...slides, ...cards, ...titles];
      if (titleLayerEl) cleanupTargets.push(titleLayerEl);
      gsap.set(cleanupTargets, { clearProps: "all" });
    };
  });

  media.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set([track, ...titles], { clearProps: "all" });

    return () => {
      gsap.set([track, ...titles], { clearProps: "all" });
    };
  });

  return () => media.revert();
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
