/**
 * FooterBottomBar — full-width accent strip with copyright (left)
 * and social links (right).
 *
 * Uses --color-accent as background to match the project palette.
 */

import {
  FOOTER_COPYRIGHT_YEAR,
  SITE_NAME,
  FOOTER_SOCIAL_LABELS,
} from "@/constants";

export default function FooterBottomBar() {
  return (
    <div className="footer-bottom-bar">
      <div
        className="section-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          padding: "0.75rem var(--section-px)",
          maxWidth: "100%",
        }}
      >
        {/* Copyright — left */}
        <span className="footer-bottom-bar__item">
          Copyright &copy; {SITE_NAME.replace(" Wallet", "")}{" "}
          {FOOTER_COPYRIGHT_YEAR}
        </span>

        {/* Social links — right */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
          }}
        >
          {FOOTER_SOCIAL_LABELS.map((label) => (
            <a
              key={label}
              href="#"
              className="footer-bottom-bar__item footer-bottom-bar__link"
              style={{ textDecoration: "none" }}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
