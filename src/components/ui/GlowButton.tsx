/**
 * GlowButton — CTA button with cursor-following gradient highlight.
 *
 * The button stays completely static (no tilt, no zoom, no movement).
 * Only the internal radial gradient glow follows the mouse cursor.
 *
 * Uses the Arctic Mist palette from the current OffPay app.
 */

"use client";

import { useRef, useState, useCallback } from "react";

export interface GlowButtonProps {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  target?: string;
  rel?: string;
  download?: boolean;
}

export default function GlowButton({
  label,
  href,
  onClick,
  variant = "primary",
  target,
  rel,
  download,
}: GlowButtonProps) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const [hovering, setHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({ x, y });
    },
    [],
  );

  const handleMouseEnter = useCallback(() => setHovering(true), []);
  const handleMouseLeave = useCallback(() => {
    setHovering(false);
    setMousePos({ x: 50, y: 50 });
  }, []);

  const isPrimary = variant === "primary";

  const baseStyle: React.CSSProperties = {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    fontWeight: 600,
    fontSize: "0.95rem",
    borderRadius: "9999px",
    padding: "0.75rem 1.75rem",
    cursor: "pointer",
    textDecoration: "none",
    border: isPrimary
      ? "1px solid var(--color-border)"
      : "1px solid rgba(14, 42, 53, 0.18)",
    color: "var(--color-text)",
    lineHeight: 1,
    overflow: "hidden",
    background: isPrimary
      ? hovering
        ? "var(--gradient-accent-hover)"
        : "var(--color-text-inverse)"
      : "rgba(252, 252, 255, 0.34)",
    boxShadow: hovering
      ? "0 16px 38px rgba(14, 42, 53, 0.2), inset 1px 1px 0 rgba(252, 252, 255, 0.9)"
      : "0 12px 30px rgba(14, 42, 53, 0.14), inset 1px 1px 0 rgba(252, 252, 255, 0.78)",
  };

  const glowOverlay: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: "inherit",
    background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(91, 200, 232, ${hovering ? 0.36 : 0}) 0%, transparent 65%)`,
    transition: hovering ? "none" : "background 0.3s ease",
    pointerEvents: "none",
  };

  const content = (
    <>
      <span style={glowOverlay} aria-hidden="true" />
      <span style={{ position: "relative", zIndex: 1 }}>{label}</span>
    </>
  );

  const handlers = {
    onMouseMove: handleMouseMove,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onClick,
  };

  if (href) {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        style={baseStyle}
        target={target}
        rel={rel}
        {...(download ? { download: "" } : {})}
        {...handlers}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      style={baseStyle}
      {...handlers}
    >
      {content}
    </button>
  );
}
