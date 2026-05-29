/**
 * NavCtaButton — reusable CTA button for navigation contexts.
 *
 * Accepts label, variant (primary/secondary), onClick, and optional href.
 * Used in the mobile navbar menu and anywhere a nav-style CTA is needed.
 */

"use client";

import type React from "react";

export interface NavCtaButtonProps {
  label: string;
  variant: "primary" | "secondary";
  onClick?: () => void;
  href?: string;
  target?: string;
  rel?: string;
  download?: boolean;
}

export default function NavCtaButton({
  label,
  variant,
  onClick,
  href,
  target,
  rel,
  download,
}: NavCtaButtonProps) {
  const isPrimary = variant === "primary";

  const style: React.CSSProperties = {
    display: "block",
    width: "100%",
    padding: "16px 24px",
    fontSize: "16px",
    fontWeight: 500,
    textAlign: "center",
    textDecoration: "none",
    borderRadius: "999px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: isPrimary
      ? "1px solid var(--color-border)"
      : "1px solid rgba(14, 42, 53, 0.16)",
    background: isPrimary
      ? "var(--color-text-inverse)"
      : "rgba(252, 252, 255, 0.5)",
    color: "var(--color-text)",
    letterSpacing: "0",
    boxShadow: isPrimary
      ? "0 12px 30px rgba(14, 42, 53, 0.14), inset 1px 1px 0 rgba(252, 252, 255, 0.78)"
      : "none",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
  };

  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        style={style}
        target={target}
        rel={rel}
        {...(download ? { download: "" } : {})}
      >
        {label}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} style={style}>
      {label}
    </button>
  );
}
