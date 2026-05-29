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
import { FOOTER_EMAIL, NAV_LINKS, DOWNLOAD_APK_URL } from "@/constants";

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

          {/* Right — download */}
          <a
            href={DOWNLOAD_APK_URL}
            target="_blank"
            rel="noopener noreferrer"
            download
            aria-label="Download Android APK"
            className="footer-download-btn"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="footer-download-btn__icon"
            >
              <path d="M17.6 9.48 19.33 6.5a.5.5 0 0 0-.18-.68.5.5 0 0 0-.69.18l-1.76 3.05A10.1 10.1 0 0 0 12 7.9a10.1 10.1 0 0 0-4.7 1.15L5.54 6a.5.5 0 0 0-.69-.18.5.5 0 0 0-.18.68L6.4 9.48C3.77 11 2 13.6 2 16.58V18h20v-1.42c0-2.98-1.77-5.58-4.4-7.1ZM7.25 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm9.5 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z" />
            </svg>
            Download APK
          </a>
        </div>
      </div>

      {/* Giant wordmark (full-bleed) */}
      <FooterWordmark />

      {/* Bottom bar */}
      <FooterBottomBar />
    </footer>
  );
}
