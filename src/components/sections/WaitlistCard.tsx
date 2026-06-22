"use client";

import { useRef, useState, type CSSProperties } from "react";

const ICON_PATH =
  "m55.9 51h-27.2v-2.2h28.5c-0.5-1.1-1.3-1.9-3.4-1.8h-29.3c-3.9-0.1-6 3.1-6 6.5v25.5c0 5.3 3.5 8.8 10.3 8.9h19.5c6.8 0.1 11.5-3.2 11.9-9.1v-23.8c0.1-2.7-1.6-4-4.3-4zm-21.3 19.6h-7.3v-3c0-1.6 1.3-3.5 3.7-3.3 2.1 0.2 3.6 1.7 3.6 3.7v2.6zm16 0h-7.6v-2.8c0-1.9 1.6-3.7 3.8-3.7s3.8 1.6 3.8 3.6v2.9z";

const JOINED_SUCCESS_COPY = {
  title: "You're on the list.",
  body: "Launch access will go to",
  label: "Confirmed",
};

const REGISTERED_SUCCESS_COPY = {
  title: "Already on the list.",
  body: "We already have this email",
  label: "Registered",
};

const CONFETTI_PARTICLES = [
  { x: "-124px", y: "-54px", r: "-28deg", d: "0ms", c: "#ffffff", s: "6px" },
  { x: "-90px", y: "-84px", r: "18deg", d: "35ms", c: "#bdbdbd", s: "5px" },
  { x: "-48px", y: "-66px", r: "42deg", d: "70ms", c: "#f5f5f5", s: "7px" },
  { x: "-12px", y: "-92px", r: "-12deg", d: "110ms", c: "#d7d7d7", s: "5px" },
  { x: "32px", y: "-78px", r: "24deg", d: "55ms", c: "#ffffff", s: "6px" },
  { x: "72px", y: "-60px", r: "-36deg", d: "95ms", c: "#cfcfcf", s: "5px" },
  { x: "112px", y: "-42px", r: "16deg", d: "20ms", c: "#f1f1f1", s: "7px" },
  { x: "-106px", y: "6px", r: "34deg", d: "130ms", c: "#e2e2e2", s: "5px" },
  { x: "-62px", y: "28px", r: "-20deg", d: "85ms", c: "#ffffff", s: "6px" },
  { x: "18px", y: "22px", r: "38deg", d: "145ms", c: "#b8b8b8", s: "5px" },
  { x: "58px", y: "18px", r: "-16deg", d: "115ms", c: "#ffffff", s: "6px" },
  { x: "104px", y: "4px", r: "30deg", d: "65ms", c: "#dcdcdc", s: "5px" },
];

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

function SuccessConfetti() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[32px]"
      aria-hidden="true"
    >
      <div className="absolute left-1/2 top-[42%] h-1 w-1">
        {CONFETTI_PARTICLES.map((particle, index) => (
          <span
            key={`${particle.x}-${particle.y}-${index}`}
            className="absolute block rounded-[2px] opacity-0 motion-safe:animate-[waitlist-confetti_780ms_cubic-bezier(0,0,0.2,1)_forwards]"
            style={{
              "--confetti-x": particle.x,
              "--confetti-y": particle.y,
              "--confetti-r": particle.r,
              animationDelay: particle.d,
              background: particle.c,
              height: particle.s,
              width: particle.s,
            } as CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}

type WaitlistResponse = {
  status?: "success" | "error";
  code?: string;
  error?: string;
  count?: number;
  retryAfterSeconds?: number;
};

function formatRetryAfter(seconds: number) {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  return `${Math.ceil(seconds / 60)}m`;
}

function getFriendlyWaitlistError(data: WaitlistResponse | null) {
  if (!data) {
    return "We couldn't reach the waitlist. Please try again in a moment.";
  }

  if (data.code === "rate_limited") {
    const retryAfter =
      typeof data.retryAfterSeconds === "number"
        ? ` Try again in ${formatRetryAfter(data.retryAfterSeconds)}.`
        : "";

    return `Please wait before trying again.${retryAfter}`;
  }

  if (data.code === "temporarily_unavailable") {
    return "We couldn't add you right now. Please try again in a few minutes.";
  }

  if (data.code === "already_registered") {
    return "You're already on the waitlist.";
  }

  if (data.code === "invalid_email" || data.code === "invalid_request") {
    return data.error || "Please check your email and try again.";
  }

  return "We couldn't add you right now. Please try again in a moment.";
}

export default function WaitlistCard({ initialCount }: { initialCount: number }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [successCopy, setSuccessCopy] = useState(JOINED_SUCCESS_COPY);
  const [successKind, setSuccessKind] = useState<"joined" | "registered">(
    "joined"
  );
  const [submittedEmail, setSubmittedEmail] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function showSuccess(
    copy: typeof JOINED_SUCCESS_COPY,
    kind: "joined" | "registered",
    cleanEmail: string
  ) {
    setSuccessCopy(copy);
    setSuccessKind(kind);
    setSubmittedEmail(cleanEmail);
    setError(null);
    setStatus("success");
    setTimeout(() => {
      setStatus("idle");
      setEmail("");
    }, 6000);
  }

  function onButtonClick() {
    // If already processing, ignore
    if (status !== "idle") return;

    const cleanEmail = email.trim();

    setError(null);
    setStatus("loading");

    void fetch("/api/waitlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: cleanEmail }),
    })
      .then(async (res) => {
        let data: WaitlistResponse | null = null;

        try {
          data = (await res.json()) as WaitlistResponse;
        } catch {
          data = null;
        }

        if (typeof data?.count === "number") {
          setCount(data.count);
        }

        if (data?.code === "already_registered") {
          showSuccess(REGISTERED_SUCCESS_COPY, "registered", cleanEmail);
          return;
        }

        if (!res.ok || data?.status === "error") {
          throw new Error(getFriendlyWaitlistError(data));
        }

        showSuccess(JOINED_SUCCESS_COPY, "joined", cleanEmail);
      })
      .catch((err: unknown) => {
        setStatus("idle");
        setError(
          err instanceof Error
            ? err.message
            : "We couldn't add you right now. Please try again in a moment."
        );
        setShake(true);
        inputRef.current?.focus();
        setTimeout(() => setShake(false), 600);
      });
  }

  function onInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      onButtonClick();
    }
  }

  return (
    <div className="w-full max-w-md mx-auto mt-4 sm:mt-5">
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
          className={[
            "relative p-5 sm:p-6 rounded-[32px] flex flex-col transition-[opacity,transform] duration-500 min-h-[200px] sm:min-h-[250px]",
            status === "success" ? "items-center text-center justify-center" : "items-start text-left justify-start"
          ].join(" ")}
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(12px)",
            zIndex: 1,
            isolation: "isolate",
          }}
        >
          {status === "success" && successKind === "joined" && (
            <SuccessConfetti />
          )}

          {/* Card Form — visible when NOT success */}
          <div
            className={[
              "w-full flex flex-col items-start text-left transition-[opacity,transform] duration-500",
              status === "success"
                ? "opacity-0 scale-95 pointer-events-none absolute inset-x-0 px-5 sm:px-6"
                : "opacity-100 scale-100",
            ].join(" ")}
          >

            {/* Avatars */}
            <div className="flex items-center mb-4 sm:mb-5 transition-opacity duration-300">
              <div className="flex items-center">
                <div className="w-7 h-7 rounded-[8px] flex items-center justify-center overflow-hidden p-0.5 bg-[#242424] border border-white/5">
                  <AppIcon className="w-full h-full text-white" />
                </div>
                <div className="w-7 h-7 rounded-[8px] -ml-2.5 flex items-center justify-center overflow-hidden p-0.5 bg-[#2a2a2a] border border-white/5">
                  <AppIcon className="w-full h-full text-white" />
                </div>
                <div className="w-7 h-7 rounded-[8px] -ml-2.5 flex items-center justify-center overflow-hidden p-0.5 bg-[#333333] border border-white/5">
                  <AppIcon className="w-full h-full text-white" />
                </div>
              </div>
              <span className="ml-2.5 text-xs font-semibold text-[#8F8F8F] font-mono tracking-wide">
                +{count.toLocaleString()}
              </span>
            </div>

            {/* Heading */}
            <h2
              className="text-2xl font-medium mb-1.5 sm:mb-2 text-white"
              style={{
                fontFamily: "var(--font-migra), serif",
                letterSpacing: "-0.02em",
              }}
            >
              Join the waitlist
            </h2>

            {/* Subtitle */}
            <p
              className="text-[11.5px] xs:text-[12.5px] sm:text-[14px] mb-5 sm:mb-8 text-[#8F8F8F]"
              style={{ fontFamily: "var(--font-modernera), monospace" }}
            >
              Sign up to be one of the first to use OffPay.
            </p>

            {/* Email input + button — NO form, NO overlays */}
            <div
              className="flex flex-col sm:flex-row items-stretch sm:items-center w-full p-2 sm:p-1.5 rounded-[24px] sm:rounded-full transition-colors duration-300 gap-2 sm:gap-0"
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
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={onInputKeyDown}
                placeholder="Enter your email..."
                autoComplete="email"
                spellCheck={false}
                aria-invalid={error ? "true" : undefined}
                aria-describedby={error ? "waitlist-error" : undefined}
                disabled={status !== "idle"}
                className="flex-1 min-w-0 bg-transparent border-none outline-none text-white px-4 py-3 sm:py-2 text-[13px] sm:text-[14px] placeholder-white/30 disabled:opacity-50"
                style={{ fontFamily: "var(--font-modernera), monospace" }}
              />

              <button
                type="button"
                onClick={onButtonClick}
                disabled={status !== "idle"}
                className={[
                  "rounded-full px-4 sm:px-4 py-[12px] sm:py-[8.5px]",
                  "flex items-center justify-center",
                  "font-medium text-[13px] sm:text-[14px] leading-none",
                  "font-mono tracking-[-0.02em]",
                  "transition-[background-color,color,transform] duration-300",
                  "whitespace-nowrap w-full sm:w-auto sm:min-w-[115px]",
                  "cursor-pointer select-none",
                  status === "success"
                    ? "bg-white text-black scale-105"
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

            <p
              id="waitlist-error"
              role={error ? "alert" : undefined}
              aria-live="polite"
              className={[
                "min-h-[18px] text-[11px] sm:text-xs mt-3 px-1 tracking-tight font-mono transition-colors w-full",
                error ? "text-[#FF5C5C]" : "text-transparent",
              ].join(" ")}
            >
              {error || " "}
            </p>
          </div>

          {/* Success Content — visible when success */}
          <div
            className={[
              "w-full flex flex-col items-center justify-center text-center transition-[opacity,transform] duration-500",
              status === "success"
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95 pointer-events-none absolute inset-x-0 px-5 sm:px-7",
            ].join(" ")}
          >
            <div className="relative mb-4 flex items-center justify-center">
              <div className="absolute h-16 w-16 rounded-[18px] bg-white/10 blur-xl pointer-events-none" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-[18px] border border-white/10 bg-white text-black shadow-[0_18px_48px_rgba(0,0,0,0.32)]">
                <AppIcon className="h-11 w-11" />
              </div>
            </div>

            <div className="mb-3 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.16em] text-white/65">
              {successCopy.label}
            </div>

            <h2
              className="text-2xl font-medium mb-2 text-white max-w-[280px]"
              style={{
                fontFamily: "var(--font-migra), serif",
                letterSpacing: "-0.02em",
                lineHeight: 1.15
              }}
            >
              {successCopy.title}
            </h2>

            <p
              className="text-[13px] sm:text-[14px] text-[#9A9A9A] leading-relaxed max-w-[280px]"
              style={{ fontFamily: "var(--font-modernera), monospace" }}
            >
              {successCopy.body}
            </p>

            <div className="mt-4 w-full max-w-[300px] rounded-[20px] border border-white/10 bg-black/10 px-4 py-3 text-left">
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-[12px] text-white">
                  {submittedEmail}
                </span>
                <span className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-[10px] font-mono text-white/70">
                  +{count.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
