"use client";

import type { NavLink } from "@/types";
import NavLogo from "./NavLogo";

export interface NavbarProps {
  links: NavLink[];
}

export default function Navbar({ }: NavbarProps) {
  return (
    <header className="pointer-events-none fixed top-0 left-0 right-0 w-full font-mono text-white transition-colors duration-300 z-50">
      <div className="pt-0 pb-0 mx-auto max-w-[90rem] px-5 flex w-full items-center justify-between h-[100px]">
        <div className="w-full flex items-center justify-between z-[2] relative">

          {/* Logo */}
          <NavLogo />

          {/* Responsive Badge */}
          <button
            type="button"
            className="rounded-full px-4 h-[38px] flex items-center justify-center bg-white text-black font-medium uppercase text-[14px] sm:text-[16px] leading-none font-mono tracking-[-0.02em] border border-black/50 hover:bg-black hover:text-white transition-all duration-300 opacity-100 pointer-events-auto select-none whitespace-nowrap"
          >
            <span className="mt-px">Join Waitlist</span>
          </button>

        </div>
      </div>
    </header>
  );
}