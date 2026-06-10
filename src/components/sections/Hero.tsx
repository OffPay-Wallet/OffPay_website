/**
 * Hero — Clean hero section with form
 */

"use client";

import { useState } from "react";
import { WaveBackground } from "./WaveBackground";

export default function Hero() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email submitted:", email);
    // TODO: Handle form submission
  };

  return (
    <section
      className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-[#0A0A0A]"
      style={{
        paddingTop: "120px",
      }}
    >
      <WaveBackground />

      <div
        className="relative z-10 text-center px-6 max-w-4xl mx-auto"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "48px",
        }}
      >
        {/* Headline */}
        <h1
          style={{
            fontFamily: "var(--font-migra), serif",
            fontSize: "clamp(32px, 6vw, 60px)",
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            color: "#FFFFFF",
            margin: 0,
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

        {/* Waitlist Card Wrapper with Animated Glow */}
        <div className="relative w-full max-w-md mx-auto z-20 group">

          {/* Animated Border Beam */}
          <div
            className="absolute -inset-[1px] rounded-[33px] pointer-events-none overflow-hidden"
            style={{
              padding: "1.5px", // Width of the glowing beam
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          >
            <div
              className="absolute inset-[-100%] animate-[spin_4s_linear_infinite]"
              style={{
                background: "conic-gradient(from 0deg, transparent 75%, rgba(255, 255, 255, 0.85) 85%, transparent 100%)",
              }}
            />
          </div>

          {/* Waitlist Card */}
          <div
            className="w-full h-full p-6 sm:p-8 rounded-[32px] flex flex-col items-start text-left relative z-20"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.03)", // Very subtle static border so the glow pops
              backdropFilter: "blur(12px)",
            }}
          >
            {/* Avatars */}
            <div className="flex items-center mb-6">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full border-2 border-[#111111] z-30 flex items-center justify-center overflow-hidden" style={{ background: "linear-gradient(135deg, #333 0%, #111 100%)" }}>
                  <svg className="w-4 h-4 text-white/50" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-[#111111] -ml-3 z-20 flex items-center justify-center overflow-hidden" style={{ background: "linear-gradient(135deg, #444 0%, #222 100%)" }}>
                  <svg className="w-4 h-4 text-white/50" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-[#111111] -ml-3 z-10 flex items-center justify-center overflow-hidden" style={{ background: "linear-gradient(135deg, #555 0%, #333 100%)" }}>
                  <svg className="w-4 h-4 text-white/50" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                </div>
              </div>
              <span className="ml-3 text-sm font-medium text-[#8F8F8F] font-mono tracking-wide">+2K</span>
            </div>

            {/* Heading */}
            <h2
              className="text-2xl font-medium mb-2 text-white"
              style={{ fontFamily: "var(--font-migra), serif", letterSpacing: "-0.02em" }}
            >
              Join the waitlist
            </h2>

            {/* Subtitle */}
            <p
              className="text-[14px] sm:text-[15px] mb-6 sm:mb-8 text-[#8F8F8F]"
              style={{ fontFamily: "var(--font-modernera), monospace" }}
            >
              Sign up to be one of the first to use OffPay.
            </p>

            {/* Pill Form */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center w-full p-1.5 rounded-full transition-colors duration-300 group"
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email..."
                required
                className="flex-1 min-w-0 bg-transparent border-none outline-none text-white px-3 sm:px-4 py-2 text-[14px] sm:text-[15px] placeholder-white/30"
                style={{
                  fontFamily: "var(--font-modernera), monospace",
                }}
              />
              <button
                type="submit"
                className="rounded-full px-4 sm:px-5 py-[10px] flex items-center justify-center bg-white text-black font-medium text-[14px] sm:text-[15px] leading-none font-mono tracking-[-0.02em] hover:bg-[#E5E5E5] transition-all duration-300 whitespace-nowrap flex-shrink-0"
              >
                Get Notified
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 ml-1.5 -mr-1"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
