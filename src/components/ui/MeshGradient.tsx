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
            radial-gradient(circle at 50% 20%, rgba(252, 252, 255, 0.82) 0%, rgba(252, 252, 255, 0) 34%),
            radial-gradient(circle at 18% 82%, rgba(223, 247, 250, 0.72) 0%, rgba(223, 247, 250, 0) 32%),
            linear-gradient(180deg, #5BC8E8 0%, #BDEFF7 38%, #FCFCFF 64%, #DFF7FA 84%, #5BC8E8 100%)
          `,
        }}
      />



      {/* HalftoneDots shader texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.2,
          mixBlendMode: "multiply",
        }}
      >
        <HalftoneDots
          style={{ width: "100%", height: "100%" }}
          colorBack="#DFF7FA"
          colorFront="#5BC8E8"
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
