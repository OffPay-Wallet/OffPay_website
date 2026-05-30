/**
 * Footer — site-wide footer section.
 *
 * Compact layout:
 *   1. Top row — nav links, email contact, download CTA
 *   2. Giant wordmark (full-bleed)
 *   3. Bottom bar — copyright + socials
 */

import FooterWordmark from "@/components/ui/footer/FooterWordmark";
import FooterBottomBar from "@/components/ui/footer/FooterBottomBar";
import { FOOTER_EMAIL, NAV_LINKS } from "@/constants";

export default function Footer() {
  return (
    <footer aria-label="Site footer" className="footer">
      <div className="section-container footer__inner">
        {/* Top row — nav + contact + download */}
        <div className="footer__top">
          {/* Left — nav links */}
          <nav className="footer-nav" aria-label="Footer navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="footer-nav__link"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Center — email (only this is clickable) */}
          <div className="footer-contact">
            <span className="footer-contact__label">Contact</span>
            <a
              href={`mailto:${FOOTER_EMAIL}`}
              className="footer-contact__email"
            >
              {FOOTER_EMAIL}
            </a>
          </div>

          {/* Right — coming soon */}
          <span
            aria-label="Coming soon"
            className="footer-download-btn"
            style={{ cursor: "default", opacity: 0.7, pointerEvents: "none" }}
          >
            Coming soon
          </span>
        </div>
      </div>

      {/* Giant wordmark (full-bleed) */}
      <FooterWordmark />

      {/* Bottom bar */}
      <FooterBottomBar />
    </footer>
  );
}
