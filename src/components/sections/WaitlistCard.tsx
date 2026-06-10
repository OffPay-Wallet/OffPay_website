"use client";

import { useState, useRef } from "react";

const ICON_PATH =
  "m55.9 51h-27.2v-2.2h28.5c-0.5-1.1-1.3-1.9-3.4-1.8h-29.3c-3.9-0.1-6 3.1-6 6.5v25.5c0 5.3 3.5 8.8 10.3 8.9h19.5c6.8 0.1 11.5-3.2 11.9-9.1v-23.8c0.1-2.7-1.6-4-4.3-4zm-21.3 19.6h-7.3v-3c0-1.6 1.3-3.5 3.7-3.3 2.1 0.2 3.6 1.7 3.6 3.7v2.6zm16 0h-7.6v-2.8c0-1.9 1.6-3.7 3.8-3.7s3.8 1.6 3.8 3.6v2.9z";

function AppIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="15 45 48 45"
      className={className}
      fill="currentColor"
    >
      <path d={ICON_PATH} />
    </svg>
  );
}

export default function WaitlistCard() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function onButtonClick() {
    // If already processing, ignore
    if (status !== "idle") return;

    const cleanEmail = email.trim();

    // Validation with VISIBLE feedback
    if (!cleanEmail) {
      setError("Please enter your email address.");
      setShake(true);
      inputRef.current?.focus();
      setTimeout(() => setShake(false), 600);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address (e.g., name@domain.com).");
      setShake(true);
      inputRef.current?.focus();
      setTimeout(() => setShake(false), 600);
      return;
    }

    setError(null);
    setStatus("loading");

    // Simulate submission
    setTimeout(() => {
      setStatus("success");
      
      setTimeout(() => {
        setStatus("idle");
        setEmail("");
      }, 3000);
    }, 1000);
  }

  function onInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      onButtonClick();
    }
  }

  return (
    <div className="w-full max-w-md mx-auto mt-8 sm:mt-10">
      {/* Outer wrapper for the animated border beam */}
      <div className="relative rounded-[33px]">

        {/* Animated Border Beam — uses CSS pseudo via style tag */}
        <div
          className="absolute -inset-[1px] rounded-[33px] overflow-hidden"
          style={{
            padding: "1.5px",
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "-100%",
              background:
                "conic-gradient(from 0deg, transparent 75%, rgba(255, 255, 255, 0.85) 85%, transparent 100%)",
              animation: "spin 4s linear infinite",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Card content — above the beam, isolate stacking context */}
        <div
          className="relative p-6 sm:p-8 rounded-[32px] flex flex-col items-start text-left"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(12px)",
            zIndex: 1,
            isolation: "isolate",
          }}
        >
          {/* Avatars */}
          <div className="flex items-center mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-[8px] flex items-center justify-center overflow-hidden p-1 bg-[#242424]">
                <AppIcon className="w-full h-full text-white" />
              </div>
              <div className="w-8 h-8 rounded-[8px] -ml-3 flex items-center justify-center overflow-hidden p-1 bg-[#2a2a2a]">
                <AppIcon className="w-full h-full text-white" />
              </div>
              <div className="w-8 h-8 rounded-[8px] -ml-3 flex items-center justify-center overflow-hidden p-1 bg-[#333333]">
                <AppIcon className="w-full h-full text-white" />
              </div>
            </div>
            <span className="ml-3 text-sm font-medium text-[#8F8F8F] font-mono tracking-wide">
              +2K
            </span>
          </div>

          {/* Heading */}
          <h2
            className="text-2xl font-medium mb-2 text-white"
            style={{
              fontFamily: "var(--font-migra), serif",
              letterSpacing: "-0.02em",
            }}
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

          {/* Email input + button — NO form, NO overlays */}
          <div
            className="flex items-center w-full p-1.5 rounded-full transition-all duration-300"
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: shake
                ? "1px solid rgba(255, 80, 80, 0.5)"
                : "1px solid rgba(255, 255, 255, 0.08)",
              animation: shake ? "headShake 0.5s ease-in-out" : "none",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={onInputKeyDown}
              placeholder="Enter your email..."
              disabled={status !== "idle"}
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-white px-3 sm:px-4 py-2 text-[14px] sm:text-[15px] placeholder-white/30 disabled:opacity-50"
              style={{ fontFamily: "var(--font-modernera), monospace" }}
            />

            <button
              type="button"
              onClick={onButtonClick}
              disabled={status !== "idle"}
              className={[
                "rounded-full px-4 sm:px-5 py-[10px]",
                "flex items-center justify-center",
                "font-medium text-[14px] sm:text-[15px] leading-none",
                "font-mono tracking-[-0.02em]",
                "transition-all duration-300",
                "whitespace-nowrap flex-shrink-0 min-w-[140px]",
                "cursor-pointer select-none",
                status === "success"
                  ? "bg-green-500 text-black scale-105"
                  : status === "loading"
                  ? "bg-white/20 text-white cursor-wait"
                  : "bg-white text-black hover:bg-[#E5E5E5] hover:scale-105 active:scale-95",
              ].join(" ")}
            >
              {status === "idle" && (
                <>
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
                </>
              )}

              {status === "loading" && (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Sending...
                </>
              )}

              {status === "success" && (
                <span className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Added!
                </span>
              )}
            </button>
          </div>

          {error && (
            <p
              className="text-[#FF5050] text-[13px] mt-3.5 px-2.5 font-mono tracking-tight"
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
