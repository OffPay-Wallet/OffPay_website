"use client"
import { AnimatePresence, motion } from "motion/react"
import type { MotionProps } from "motion/react"
import type React from "react"

export interface BlurRevealProps {
  children: string
  className?: string
  delay?: number
  speedReveal?: number
  speedSegment?: number
  trigger?: boolean
  onAnimationComplete?: () => void
  onAnimationStart?: () => void
  as?: keyof React.JSX.IntrinsicElements
  style?: MotionProps["style"]
  inView?: boolean
  once?: boolean
  letterSpacing?: string | number
}

export function BlurReveal({
  children,
  className,
  delay = 0,
  speedReveal = 1.5,
  speedSegment = 0.5,
  trigger = true,
  onAnimationComplete,
  onAnimationStart,
  as = "p",
  style,
  inView = false,
  once = true,
  letterSpacing,
}: BlurRevealProps) {
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div

  const stagger = 0.03 / speedReveal
  const baseDuration = 0.3 / speedSegment

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
    exit: {
      transition: {
        staggerChildren: stagger,
        staggerDirection: -1,
      },
    },
  }

  // Cheaper blur (6px instead of 12px) — still reads as a blur reveal but
  // doesn't push the GPU into a heavy multi-pass paint per glyph. Per-char
  // `willChange` promotes each span to its own composited layer so the
  // blur animation stays on the GPU thread instead of forcing repaint.
  const itemVariants = {
    hidden: { opacity: 0, filter: "blur(6px)", y: 8 },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        duration: baseDuration,
      },
    },
    exit: { opacity: 0, filter: "blur(6px)", y: 8 },
  }

  const charStyle: MotionProps["style"] = {
    willChange: "filter, opacity, transform",
    ...(letterSpacing !== undefined ? { marginRight: letterSpacing } : {}),
  }

  return (
    // Plain AnimatePresence (no `mode="popLayout"`) — popLayout forces a
    // layout pass on every child unmount, which compounded with per-char
    // exit animations is a significant scroll-time cost. The default mode
    // is enough for our trigger-based use case.
    <AnimatePresence>
      {trigger && (
        <MotionTag
          initial="hidden"
          {...(inView ? { whileInView: "visible" } : { animate: "visible" })}
          exit="exit"
          variants={containerVariants}
          viewport={{ once }}
          {...(className ? { className } : {})}
          {...(onAnimationComplete ? { onAnimationComplete } : {})}
          {...(onAnimationStart ? { onAnimationStart } : {})}
          {...(style ? { style } : {})}
        >
          <span className="sr-only">{children}</span>
          {children &&
            children.split(" ").map((word, wordIndex, wordsArray) => (
              <span key={`word-${wordIndex}`} className="inline-block whitespace-nowrap" aria-hidden="true">
                {word.split("").map((char, charIndex) => (
                  <motion.span
                    key={`char-${wordIndex}-${charIndex}`}
                    variants={itemVariants}
                    className="inline-block"
                    style={charStyle}
                  >
                    {char}
                  </motion.span>
                ))}
                {wordIndex < wordsArray.length - 1 && (
                  <motion.span
                    key={`space-${wordIndex}`}
                    variants={itemVariants}
                    className="inline-block"
                    style={charStyle}
                  >
                    &nbsp;
                  </motion.span>
                )}
              </span>
            ))}
        </MotionTag>
      )}
    </AnimatePresence>
  )
}
