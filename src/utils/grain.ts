/**
 * Grain/Noise texture utilities for creating film grain effects
 * Used in navbar and other grayscale components
 */

/**
 * Generate inline SVG noise texture as data URL
 * Can be used as background-image for grain effect
 */
export function generateGrainTexture(
  opacity: number = 0.5,
  baseFrequency: number = 0.9,
  numOctaves: number = 4
): string {
  const svg = `
    <svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'>
      <filter id='noise'>
        <feTurbulence 
          type='fractalNoise' 
          baseFrequency='${baseFrequency}' 
          numOctaves='${numOctaves}' 
        />
      </filter>
      <rect width='100%' height='100%' filter='url(#noise)' opacity='${opacity}'/>
    </svg>
  `.trim();

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Grain overlay style object
 * Apply to any element for subtle film grain texture
 */
export const grainOverlayStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  opacity: 0.03,
  pointerEvents: "none" as const,
  backgroundImage: generateGrainTexture(),
  backgroundRepeat: "repeat",
  backgroundSize: "200px 200px",
  mixBlendMode: "overlay" as const,
};

/**
 * Create grain overlay as React element
 */
export function GrainOverlay({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <div
      style={{
        ...grainOverlayStyle,
        opacity,
      }}
      aria-hidden="true"
    />
  );
}
