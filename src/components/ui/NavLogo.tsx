import React from "react";
import Link from "next/link";

export default function NavLogo() {
  return (
    <Link 
      href="/" 
      aria-label="Go to Homepage" 
      className="z-[55] flex flex-shrink-0 items-center opacity-100 pointer-events-auto transition-opacity duration-300 hover:opacity-80 -translate-y-[3px]"
    >
      {/* Logo Mark isolated from the provided SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="15 45 48 45"
        className="h-8 w-auto text-white"
      >
        <path
          d="m55.9 51h-27.2v-2.2h28.5c-0.5-1.1-1.3-1.9-3.4-1.8h-29.3c-3.9-0.1-6 3.1-6 6.5v25.5c0 5.3 3.5 8.8 10.3 8.9h19.5c6.8 0.1 11.5-3.2 11.9-9.1v-23.8c0.1-2.7-1.6-4-4.3-4zm-21.3 19.6h-7.3v-3c0-1.6 1.3-3.5 3.7-3.3 2.1 0.2 3.6 1.7 3.6 3.7v2.6zm16 0h-7.6v-2.8c0-1.9 1.6-3.7 3.8-3.7s3.8 1.6 3.8 3.6v2.9z"
          fill="currentColor"
        />
      </svg>
      {/* Brand text applied with Shinkei bold font styling as requested */}
      <span 
        style={{ fontFamily: "var(--font-migra), serif" }} 
        className="text-[32px] font-bold leading-[1.05] tracking-[-0.03em] text-white translate-y-[3px]"
      >
        OffPay
      </span>
    </Link>
  );
}
