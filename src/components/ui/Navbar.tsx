"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import type { NavLink } from "@/types";
import NavLogo from "./NavLogo";

export interface NavbarProps {
  links: NavLink[];
}

export default function Navbar({ links }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoverStyle, setHoverStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (index: number, e: React.MouseEvent<HTMLAnchorElement>) => {
    setHoveredIndex(index);
    const container = containerRef.current;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const elRect = e.currentTarget.getBoundingClientRect();
    
    // Calculate position relative to the container's padding
    const leftPosition = elRect.left - containerRect.left;
    
    setHoverStyle({
      left: leftPosition,
      width: elRect.width,
      opacity: 1
    });
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setHoverStyle(prev => ({ ...prev, opacity: 0 }));
  };

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
    <header className="pointer-events-none fixed top-0 left-0 right-0 w-full font-mono text-white transition-colors duration-300 z-50">
      <div className="pt-0 pb-0 mx-auto max-w-[90rem] px-5 flex w-full items-end justify-between h-[100px]">
        <div className="w-full flex items-center justify-between z-[2] relative">
          
          {/* Logo */}
          <NavLogo />

          {/* Desktop links container */}
          <div 
            ref={containerRef}
            className="h-[38px] hidden lg:flex flex-row items-center px-[3px] bg-white/15 backdrop-blur-md text-white rounded-full opacity-100 pointer-events-none relative overflow-visible"
            onMouseLeave={handleMouseLeave}
          >
            {/* Sliding Hover Pill */}
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{ 
                zIndex: 0,
                top: '3px',
                bottom: '3px',
                background: 'rgba(255, 255, 255, 0.35)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
              initial={false}
              animate={{
                left: hoverStyle.left,
                width: hoverStyle.width,
                opacity: hoverStyle.opacity
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />

            {links.map((link, index) => (
              <Link 
                key={link.label}
                data-nav-index={index}
                href={link.href}
                onMouseEnter={(e) => handleMouseEnter(index, e)}
                className="relative z-10 flex items-center justify-center rounded-full px-4 py-1.5 font-medium font-mono uppercase text-[16px] leading-none tracking-[-0.02em] pointer-events-auto cursor-pointer"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <span className="relative z-10 block mt-px">{link.label}</span>
              </Link>
            ))}
          </div>
          </div>

          {/* Desktop CTA */}
          <Link
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/ikarn-dev/offpay"
            className="rounded-full px-4 h-[38px] items-center justify-center hidden lg:flex bg-white text-[#FF4400] font-medium uppercase text-[16px] leading-none font-mono tracking-[-0.02em] border border-[#FF4400]/50 hover:bg-[#FF4400] hover:text-white transition-all duration-300 opacity-100 pointer-events-auto"
          >
            <span className="mt-px">Coming Soon</span>
          </Link>

          {/* Mobile menu toggle */}
          <div className="lg:hidden relative z-[54]">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="pointer-events-auto relative rounded bg-black size-[32px] p-1 flex items-center justify-center transition-all duration-300 border border-white/20"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className="lg:hidden"
        style={{
          position: "fixed",
          top: "100px",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 40,
          background: "linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 58%, #2D2D2D 100%)",
          transform: mobileOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          display: "flex",
          flexDirection: "column",
          padding: "32px",
          overflowY: "auto",
          pointerEvents: mobileOpen ? "auto" : "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.04,
            pointerEvents: "none",
            backgroundImage: `url('/noise-grain.svg')`,
            backgroundRepeat: "repeat",
            backgroundSize: "200px 200px",
            mixBlendMode: "overlay",
          }}
        />

        <nav style={{ position: "relative", zIndex: 1 }}>
          <ul
            role="list"
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "32px",
            }}
          >
            {links.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-[#B3B3B3] hover:text-white text-[24px] font-mono font-medium tracking-[0.02em] uppercase transition-colors duration-200"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div style={{ marginTop: "48px", position: "relative", zIndex: 1 }}>
          <Link
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/ikarn-dev/offpay"
            className="rounded-full px-4 h-[43px] w-full flex items-center justify-center bg-white text-[#FF4400] font-medium uppercase text-[16px] leading-none font-mono tracking-[-0.02em] border border-[#FF4400]/50 hover:bg-[#FF4400] hover:text-white transition-all duration-300 opacity-100 pointer-events-auto"
          >
            <span className="mt-px">Coming Soon</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
