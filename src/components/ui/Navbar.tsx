/**
 * Navbar — clean, minimal top navigation bar.
 *
 * Desktop: frosted floating bar — logo left · links center · CTA right.
 * Mobile:  hamburger → the navbar itself extends downward as a single
 *          continuous glassmorphic card, slides up on close.
 */

"use client";

import { useState, useEffect } from "react";
import type { NavLink } from "@/types";
import NavCtaButton from "@/components/ui/NavCtaButton";
import { DOWNLOAD_APK_URL } from "@/constants";

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */

export interface NavbarProps {
  logo: React.ReactNode;
  links: NavLink[];
  cta: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function Navbar({ logo, links, cta }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* ---- Responsive CSS ---- */}
      <style>{`
        .navbar-desktop-links,
        .navbar-desktop-cta {
          display: flex;
        }
        .navbar-hamburger {
          display: none;
        }
        .navbar-mobile-dropdown {
          display: none;
        }
        .navbar-mobile-backdrop {
          display: none;
        }

        @media (max-width: 768px) {
          .navbar-desktop-links,
          .navbar-desktop-cta {
            display: none !important;
          }
          .navbar-hamburger {
            display: flex !important;
          }
          .navbar-mobile-dropdown {
            display: block !important;
          }
          .navbar-mobile-backdrop {
            display: block !important;
          }
        }
      `}</style>

      {/* ---- Backdrop (mobile only, click to close) ---- */}
      <div
        className="navbar-mobile-backdrop"
        onClick={() => setMobileOpen(false)}
        style={{
          display: "none",
          position: "fixed",
          inset: 0,
          zIndex: 49,
          background: "rgba(14, 42, 53, 0.18)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? "auto" : "none",
          transition: "opacity 0.35s ease",
        }}
      />

      {/* ---- Unified glass navbar ---- */}
      <nav
        style={{
          position: "fixed",
          top: "16px",
          left: "50%",
          width: "min(92vw, 1120px)",
          transform: "translateX(-50%)",
          zIndex: 50,
          borderRadius: mobileOpen ? "24px" : "9999px",
          transition: `border-radius 0s ${mobileOpen ? "0s" : "0.65s"}`,
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          background: "rgba(252, 252, 255, 0.64)",
          border: "1px solid var(--color-border)",
          boxShadow:
            "0 18px 44px rgba(14, 42, 53, 0.16), inset 1px 1px 0 rgba(252, 252, 255, 0.78)",
          fontFamily:
            "var(--font-nav), system-ui, -apple-system, sans-serif",
          overflow: "hidden",
        }}
        aria-label="Main navigation"
      >
        {/* ---- Top bar (always visible) ---- */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 24px",
          }}
        >
          {/* Logo — left */}
          <a
            href="#"
            style={{ textDecoration: "none", flexShrink: 0 }}
            aria-label="Homepage"
          >
            {logo}
          </a>

          {/* Desktop: Nav Links — center */}
          <ul
            className="navbar-desktop-links"
            role="list"
            style={{
              alignItems: "center",
              gap: "6px",
              listStyle: "none",
              margin: 0,
              padding: 0,
            }}
          >
            {links.map((link) => (
              <li key={link.label}>
                <NavTextLink href={link.href} label={link.label} />
              </li>
            ))}
          </ul>

          {/* Desktop: CTA — right */}
          <div className="navbar-desktop-cta" style={{ flexShrink: 0 }}>
            {cta}
          </div>

          {/* Mobile: Hamburger / Close button */}
          <button
            className="navbar-hamburger"
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            style={{
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            {mobileOpen ? (
              /* × close icon */
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-text)"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            ) : (
              /* ☰ hamburger icon */
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-text)"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>

        {/* ---- Mobile dropdown (slides down from navbar) ---- */}
        <div
          className="navbar-mobile-dropdown"
          style={{
            display: "none",
            maxHeight: mobileOpen ? "600px" : "0px",
            opacity: mobileOpen ? 1 : 0,
            overflow: "hidden",
            transition:
              "max-height 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.4s ease",
          }}
        >
          {/* Divider */}
          <div
            style={{
              height: "1px",
              background: "rgba(14, 42, 53, 0.1)",
              margin: "0 24px",
            }}
          />

          {/* Nav rows */}
          <div style={{ padding: "8px 24px 0" }}>
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  padding: "18px 0",
                  borderBottom: "1px solid rgba(14, 42, 53, 0.08)",
                  textDecoration: "none",
                  color: "var(--color-text)",
                  fontSize: "14px",
                  fontFamily: "var(--font-nav)",
                  fontWeight: 600,
                  letterSpacing: "0",
                  textTransform: "uppercase",
                }}
              >
                <span>{link.label}</span>
              </a>
            ))}
          </div>

          {/* CTA buttons */}
          <div
            style={{
              padding: "20px 24px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <NavCtaButton
              label="Download now"
              variant="primary"
              href={DOWNLOAD_APK_URL}
              target="_blank"
              rel="noopener noreferrer"
              download
              onClick={() => setMobileOpen(false)}
            />
          </div>
        </div>
      </nav>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Plain text nav link with hover effect (desktop only)                */
/* ------------------------------------------------------------------ */

function NavTextLink({ href, label }: { href: string; label: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        display: "inline-block",
        padding: "8px 12px",
        textDecoration: "none",
        color: hovered ? "var(--color-text)" : "var(--color-text-muted)",
        fontSize: "14px",
        fontFamily: "var(--font-nav)",
        fontWeight: 500,
        transition: "color 0.3s var(--ease-out)",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ position: "relative", zIndex: 1 }}>{label}</span>
      <span
        style={{
          position: "absolute",
          left: "12px",
          right: "12px",
          bottom: "6px",
          height: "1px",
          background: "linear-gradient(90deg, #2EAED2, #5BC8E8)",
          transform: hovered ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "bottom left",
          transition: "transform 0.4s var(--ease-out)",
        }}
      />
    </a>
  );
}
