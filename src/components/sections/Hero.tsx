/**
 * Hero — Clean hero section with form
 */

"use client";

import { WaveBackground } from "./WaveBackground";
import { MeshGradient } from "@paper-design/shaders-react";
import WaitlistCard from "./WaitlistCard";

export default function Hero() {
  return (
    <section
      className="relative flex flex-col items-center justify-center overflow-hidden bg-[#0A0A0A]"
      style={{
        height: "100vh", // Fixed height to prevent scroll
        paddingTop: "120px", // Increased to bring content lower
        paddingBottom: "40px", // Minimal bottom padding
      }}
    >
      <WaveBackground />
      <div className="absolute inset-0 z-0 opacity-80 mix-blend-screen pointer-events-none">
        <MeshGradient
          colors={['#000000', '#1A1A1A', '#2D2D2D', '#0A0A0A']}
          distortion={0.5}
          swirl={0.5}
          speed={0.1}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto w-full mt-12 sm:mt-16">

        {/* Headline */}
        <h1
          className="mb-6 sm:mb-8 text-white relative z-10"
          style={{
            fontFamily: "var(--font-migra), serif",
            fontSize: "clamp(32px, 6vw, 60px)",
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            color: "#FFFFFF",
          }}
        >
          Private by default.
          <br />
          Offline-ready, AI-powered.
        </h1>

        {/* Subheadline */}
        <p
          style={{
            fontFamily: "var(--font-modernera), monospace",
            fontSize: "clamp(12px, 1.5vw, 14px)", // slightly smaller to ensure single line fit
            fontWeight: 500,
            lineHeight: 1.6,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "#8F8F8F",
            maxWidth: "100%",
            margin: 0,
          }}
        >
          Privacy-First • Offline-Ready • AI Assistant • Fast Swaps
        </p>

        <WaitlistCard />

        {/* Social Link */}
        <div className="mt-6 flex justify-center pointer-events-auto relative z-20">
          <a
            href="https://x.com/OffPaySolana"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-full text-[#8F8F8F] hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-all duration-300"
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
            aria-label="Follow on X"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-3.5 h-3.5"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
