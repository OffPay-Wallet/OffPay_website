/**
 * MeshGradient — static radial gradient with HalftoneDots shader texture.
 *
 * Gradient: Arctic Cyan through frost-white and ice-blue layers, matching the
 * current OffPay app visual system.
 *
 * Texture: @paper-design/shaders-react HalftoneDots overlay for the dotted
 * pattern visible in the reference.
 */

"use client";

import { HalftoneDots } from "@paper-design/shaders-react";

/* ------------------------------------------------------------------ */
/* Arctic Mist Palette                                                 */
/*   #5BC8E8  — Arctic Cyan                                            */
/*   #BDEFF7  — soft cyan field                                        */
/*   #DFF7FA  — frosted glass tint                                     */
/*   #FCFCFF  — bright glass fill                                      */
/* ------------------------------------------------------------------ */

export interface MeshGradientProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function MeshGradient({ className, style }: MeshGradientProps) {
  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        ...style,
      }}
    >
      {/* Static Arctic Mist gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 34%),
            radial-gradient(circle at 18% 82%, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0) 32%),
            linear-gradient(180deg, #000000 0%, #1A1A1A 38%, #2D2D2D 64%, #1A1A1A 84%, #0A0A0A 100%)
          `,
        }}
      />



      {/* HalftoneDots shader texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.3,
          mixBlendMode: "screen",
        }}
      >
        <HalftoneDots
          style={{ width: "100%", height: "100%" }}
          colorBack="#000000"
          colorFront="#6B6B6B"
          originalColors={false}
          type="gooey"
          grid="hex"
          inverted={false}
          size={0.4}
          radius={1.2}
          contrast={0.3}
          grainMixer={0.15}
          grainOverlay={0.15}
          grainSize={0.4}
        />
      </div>
    </div>
  );
}
