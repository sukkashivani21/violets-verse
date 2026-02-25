import { useMemo } from "react";
import FlowerEmoji, { getTheme } from "@/components/FlowerEmoji";

interface BouquetArrangementProps {
  flowers: string[];
  size?: "sm" | "md" | "lg";
  layoutSeed?: number;
  greeneryStyle?: "classic" | "wild" | "eucalyptus";
}

const sizeMap = {
  sm: { container: "w-52 h-56", flower: 54 },
  md: { container: "w-72 h-80", flower: 64 },
  lg: { container: "w-80 h-[22rem]", flower: 74 },
};

const greeneryClassMap = {
  classic: "opacity-80",
  wild: "opacity-95",
  eucalyptus: "opacity-90",
};

const seeded = (seed: number, n: number) => {
  const x = Math.sin(seed * 97.11 + n * 41.23) * 10000;
  return x - Math.floor(x);
};

const BouquetArrangement = ({ flowers, size = "md", layoutSeed = 7, greeneryStyle = "classic" }: BouquetArrangementProps) => {
  const positions = useMemo(() => {
    if (!flowers.length) return [] as Array<{ x: number; y: number; rotate: number; scale: number; z: number; flower: string }>;

    // Sort: large flowers first (center), small ones outer
    const weighted = [...flowers].sort((a, b) => {
      const weight = { large: 3, medium: 2, small: 1 } as const;
      return weight[getTheme(b).sizeCategory] - weight[getTheme(a).sizeCategory];
    });

    const total = weighted.length;

    // Pre-defined tight dome slots for up to 10 flowers
    // Row 1 (back/top): spread wide but high
    // Row 2 (middle): tighter
    // Row 3 (front): closest, slightly lower
    const allSlots = [
      // Center-top (hero flowers)
      { x: 50, y: 22, z: 25 },
      { x: 36, y: 28, z: 22 },
      { x: 64, y: 28, z: 22 },
      // Middle ring
      { x: 50, y: 35, z: 28 },
      { x: 28, y: 34, z: 18 },
      { x: 72, y: 34, z: 18 },
      // Outer fill
      { x: 42, y: 42, z: 30 },
      { x: 58, y: 42, z: 30 },
      { x: 32, y: 42, z: 16 },
      { x: 68, y: 42, z: 16 },
    ];

    return weighted.map((flower, i) => {
      const slot = allSlots[i % allSlots.length];
      const jitterX = (seeded(layoutSeed, i) - 0.5) * 6;
      const jitterY = (seeded(layoutSeed + 13, i) - 0.5) * 4;
      const rotate = (seeded(layoutSeed + 77, i) - 0.5) * 28;
      const scaleBase = i < 3 ? 1.05 : i < 6 ? 0.95 : 0.88;
      const scaleJitter = (seeded(layoutSeed + 99, i) - 0.5) * 0.1;

      return {
        x: slot.x + jitterX,
        y: slot.y + jitterY,
        rotate,
        scale: scaleBase + scaleJitter,
        z: slot.z,
        flower,
      };
    });
  }, [flowers, layoutSeed]);

  if (!flowers.length) return null;

  return (
    <div className="flex flex-col items-center">
      <div className={`${sizeMap[size].container} relative`}> 
        {/* Greenery layer — sits behind flowers */}
        <div className={`absolute inset-x-0 top-0 h-[85%] ${greeneryClassMap[greeneryStyle]} pointer-events-none`}>
          <svg viewBox="0 0 240 200" className="w-full h-full" aria-hidden>
            {/* Stems */}
            <g stroke="hsl(130 28% 38%)" strokeWidth="2" fill="none" strokeLinecap="round">
              <path d="M120 195 C108 150, 92 110, 62 48" />
              <path d="M120 195 C125 148, 148 108, 178 46" />
              <path d="M120 195 C119 140, 117 100, 120 32" />
              <path d="M120 195 C100 142, 72 110, 46 68" />
              <path d="M120 195 C140 145, 168 112, 194 66" />
              {greeneryStyle === "wild" && (
                <>
                  <path d="M120 195 C88 138, 48 108, 28 58" />
                  <path d="M120 195 C152 140, 192 106, 212 56" />
                </>
              )}
            </g>

            {/* Classic: elongated fern-like leaves */}
            {greeneryStyle === "classic" && (
              <g fill="hsl(135 32% 42% / 0.55)">
                <ellipse cx="55" cy="55" rx="7" ry="20" transform="rotate(-28 55 55)" />
                <ellipse cx="75" cy="78" rx="6" ry="18" transform="rotate(-12 75 78)" />
                <ellipse cx="120" cy="40" rx="5" ry="18" transform="rotate(2 120 40)" />
                <ellipse cx="165" cy="78" rx="6" ry="18" transform="rotate(14 165 78)" />
                <ellipse cx="185" cy="55" rx="7" ry="20" transform="rotate(30 185 55)" />
                <ellipse cx="48" cy="75" rx="5" ry="15" transform="rotate(-38 48 75)" />
                <ellipse cx="192" cy="72" rx="5" ry="15" transform="rotate(40 192 72)" />
                {/* Smaller accent leaves */}
                <ellipse cx="90" cy="95" rx="5" ry="13" transform="rotate(-5 90 95)" />
                <ellipse cx="150" cy="96" rx="5" ry="13" transform="rotate(7 150 96)" />
              </g>
            )}

            {/* Wild: abundant mixed foliage */}
            {greeneryStyle === "wild" && (
              <g fill="hsl(128 36% 38% / 0.5)">
                <ellipse cx="30" cy="62" rx="9" ry="22" transform="rotate(-40 30 62)" />
                <ellipse cx="52" cy="50" rx="8" ry="20" transform="rotate(-25 52 50)" />
                <ellipse cx="72" cy="72" rx="7" ry="18" transform="rotate(-10 72 72)" />
                <ellipse cx="120" cy="36" rx="6" ry="19" transform="rotate(0 120 36)" />
                <ellipse cx="168" cy="72" rx="7" ry="18" transform="rotate(12 168 72)" />
                <ellipse cx="188" cy="50" rx="8" ry="20" transform="rotate(28 188 50)" />
                <ellipse cx="210" cy="60" rx="9" ry="22" transform="rotate(42 210 60)" />
                {/* Secondary layer */}
                <ellipse cx="42" cy="82" rx="6" ry="15" transform="rotate(-32 42 82)" />
                <ellipse cx="88" cy="90" rx="6" ry="14" transform="rotate(-4 88 90)" />
                <ellipse cx="152" cy="92" rx="6" ry="14" transform="rotate(6 152 92)" />
                <ellipse cx="198" cy="80" rx="6" ry="15" transform="rotate(34 198 80)" />
                {/* Wispy filler */}
                <ellipse cx="60" cy="98" rx="4" ry="11" transform="rotate(-18 60 98)" />
                <ellipse cx="180" cy="98" rx="4" ry="11" transform="rotate(20 180 98)" />
              </g>
            )}

            {/* Eucalyptus: round coin-shaped leaves on branches */}
            {greeneryStyle === "eucalyptus" && (
              <g>
                {/* Branches */}
                <g stroke="hsl(155 22% 44%)" strokeWidth="1.5" fill="none" strokeLinecap="round">
                  <path d="M58 50 C52 62, 44 78, 38 95" />
                  <path d="M182 50 C188 62, 196 78, 202 95" />
                  <path d="M90 60 C82 75, 78 88, 72 105" />
                  <path d="M150 60 C158 75, 162 88, 168 105" />
                </g>
                {/* Round leaves along branches */}
                <g fill="hsl(155 30% 48% / 0.45)">
                  <circle cx="55" cy="52" r="7" />
                  <circle cx="50" cy="66" r="6.5" />
                  <circle cx="44" cy="80" r="6" />
                  <circle cx="40" cy="93" r="5.5" />
                  <circle cx="185" cy="52" r="7" />
                  <circle cx="190" cy="66" r="6.5" />
                  <circle cx="196" cy="80" r="6" />
                  <circle cx="200" cy="93" r="5.5" />
                  <circle cx="88" cy="62" r="6" />
                  <circle cx="83" cy="76" r="5.5" />
                  <circle cx="79" cy="90" r="5" />
                  <circle cx="74" cy="103" r="4.5" />
                  <circle cx="152" cy="62" r="6" />
                  <circle cx="157" cy="76" r="5.5" />
                  <circle cx="161" cy="90" r="5" />
                  <circle cx="166" cy="103" r="4.5" />
                  {/* Center accent */}
                  <circle cx="120" cy="34" r="6" />
                  <circle cx="115" cy="48" r="5" />
                  <circle cx="125" cy="48" r="5" />
                </g>
              </g>
            )}
          </svg>
        </div>

        {positions.map((pos, i) => (
          <div
            key={`${pos.flower}-${i}`}
            className="absolute"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: `translate(-50%, -50%) rotate(${pos.rotate}deg) scale(${pos.scale})`,
              zIndex: pos.z,
            }}
          >
            <FlowerEmoji theme={pos.flower} size={sizeMap[size].flower} />
          </div>
        ))}

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
          <svg width="76" height="72" viewBox="0 0 76 72" aria-hidden>
            <path d="M8 8 L38 66 L68 8 Z" fill="hsl(var(--muted) / 0.75)" stroke="hsl(var(--border))" strokeWidth="1.5" />
            <path d="M28 47 C32 53, 44 53, 48 47" fill="none" stroke="hsl(var(--foreground) / 0.4)" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default BouquetArrangement;
