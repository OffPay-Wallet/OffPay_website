"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* =============================================================================
   LogoSlider Component
   
   A smooth, infinite marquee/slider component for displaying logos.
   Uses Tailwind CSS where possible, raw CSS only for animations/masks.
============================================================================= */

export interface LogoSliderProps {
    /** Array of React nodes (logos, icons, images) to display */
    logos: React.ReactNode[];
    /** Animation speed - higher = slower (default: 60) */
    speed?: number;
    /** Scroll direction. Default: "left" */
    direction?: "left" | "right";
    /** Whether to show blur overlays on edges. Default: true */
    showBlur?: boolean;
    /** Number of blur layers for progressive effect. Default: 8 */
    blurLayers?: number;
    /** Blur intensity multiplier. Default: 1 */
    blurIntensity?: number;
    /** Additional CSS classes */
    className?: string;
    /** Whether to pause animation on hover. Default: false */
    pauseOnHover?: boolean;
}

/**
 * LogoSlider Component
 *
 * A beautiful infinite marquee for showcasing logos, partners, or any content.
 * Uses per-item CSS animations for optimal performance.
 */


export const LogoSlider = ({
    logos,
    speed = 20, // Reduced from 60 to 20 for a faster, smoother scroll
    direction = "left",
    showBlur = true,
    blurLayers = 8,
    blurIntensity = 1,
    className,
    pauseOnHover = false,
}: LogoSliderProps) => {
    // Duplicate logos enough times to ensure the track is wider than the viewport
    // 4 copies of 4 logos = 16 logos per track.
    const extendedLogos = Array.from({ length: 4 }).flatMap(() => logos);

    return (
        <div
            className={cn(
                "logo-slider w-full overflow-hidden relative",
                className
            )}
            style={
                {
                    "--speed": `${speed}s`,
                    "--blurs": blurLayers,
                    "--blur": blurIntensity,
                    "--gap": "clamp(3rem, 6vw, 5rem)", // Responsive gap
                } as React.CSSProperties
            }
        >
            {/* Progressive Blur Overlay - Left */}
            {showBlur && (
                <div className="logo-slider__blur logo-slider__blur--left absolute top-0 bottom-0 left-0 w-[15%] z-10 pointer-events-none rotate-180">
                    {Array.from({ length: blurLayers }).map((_, i) => (
                        <div
                            key={`blur-left-${i}`}
                            className="absolute inset-0"
                            style={{ "--blur-index": i } as React.CSSProperties}
                        />
                    ))}
                </div>
            )}

            {/* Progressive Blur Overlay - Right */}
            {showBlur && (
                <div className="logo-slider__blur logo-slider__blur--right absolute top-0 bottom-0 right-0 w-[15%] z-10 pointer-events-none">
                    {Array.from({ length: blurLayers }).map((_, i) => (
                        <div
                            key={`blur-right-${i}`}
                            className="absolute inset-0"
                            style={{ "--blur-index": i } as React.CSSProperties}
                        />
                    ))}
                </div>
            )}

            {/* Marquee Container */}
            <div 
                className="logo-slider__container flex items-center w-max min-h-[80px]"
                data-direction={direction}
                data-pause-on-hover={pauseOnHover}
            >
                {/* Track 1 */}
                <ul className="logo-slider__track flex items-center m-0 p-0 list-none shrink-0">
                    {extendedLogos.map((logo, index) => (
                        <li
                            key={`track1-${index}`}
                            className="logo-slider__item shrink-0"
                        >
                            <div className="opacity-80 hover:opacity-100 transition-opacity duration-300">
                                {logo}
                            </div>
                        </li>
                    ))}
                </ul>

                {/* Track 2 (Duplicate for seamless loop) */}
                <ul className="logo-slider__track flex items-center m-0 p-0 list-none shrink-0" aria-hidden="true">
                    {extendedLogos.map((logo, index) => (
                        <li
                            key={`track2-${index}`}
                            className="logo-slider__item shrink-0"
                        >
                            <div className="opacity-80 hover:opacity-100 transition-opacity duration-300">
                                {logo}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

LogoSlider.displayName = "LogoSlider";

export default LogoSlider;
