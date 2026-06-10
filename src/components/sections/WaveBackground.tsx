"use client";

export function WaveBackground() {
  return (
    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
      <div className="relative z-0 w-full h-full">
        <div className="h-full w-full flex overflow-hidden bg-[#0A0A0A]">
          {/* 
            Using vmax ensures the background covers the viewport 
            regardless of aspect ratio (mobile portrait or desktop landscape). 
          */}
          <div
            className="absolute top-1/2 left-1/2 flex items-center justify-center"
            style={{
              width: "200vmax",
              height: "200vmax",
              transform: "translate(-50%, -50%) rotate(45deg)",
            }}
          >
            {Array.from({ length: 19 }).map((_, i) => {
              const stop1 = 15 + (i % 3) * 2;
              const stop2 = 25 + (i % 4) * 2;
              const stop3 = 45 + (i % 5) * 2;
              const stop4 = 65 - (i % 3) * 2;
              const stop5 = 75 + (i % 2) * 2;

              const gradient = `linear-gradient(
                #000000 0%, 
                #111111 ${stop1}%, 
                #1A1A1A ${stop2}%, 
                #2D2D2D ${stop3}%, 
                #1A1A1A ${stop4}%, 
                #111111 ${stop5}%, 
                #000000 100%
              )`;

              return (
                <div
                  key={i}
                  style={{
                    flex: "1 1 0%",
                    height: "150%", // Make strips taller than container to allow Y translation without showing edges
                    willChange: "transform",
                    background: gradient,
                    animation: `waveAnimation 6s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes waveAnimation {
          0% { transform: translateY(0%); }
          50% { transform: translateY(-10%); }
          100% { transform: translateY(0%); }
        }
      ` }} />
    </div>
  );
}
