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

    const weighted = [...flowers].sort((a, b) => {
      const weight = { large: 3, medium: 2, small: 1 } as const;
      return weight[getTheme(b).sizeCategory] - weight[getTheme(a).sizeCategory];
    });

    const centerSlots = [
      { x: 50, y: 28 },
      { x: 38, y: 34 },
      { x: 62, y: 34 },
      { x: 50, y: 40 },
    ];

    return weighted.map((flower, i) => {
      const jitterX = (seeded(layoutSeed, i) - 0.5) * 8;
      const jitterY = (seeded(layoutSeed + 13, i) - 0.5) * 6;
      const rotate = (seeded(layoutSeed + 77, i) - 0.5) * 24;

      if (i < centerSlots.length) {
        const base = centerSlots[i];
        return {
          x: base.x + jitterX * 0.4,
          y: base.y + jitterY * 0.4,
          rotate,
          scale: 1.02 - i * 0.03,
          z: 20 - i,
          flower,
        };
      }

      const ringIndex = i - centerSlots.length;
      const angle = (ringIndex / Math.max(1, flowers.length - centerSlots.length)) * Math.PI;
      const radiusX = 30 + seeded(layoutSeed + 31, i) * 8;
      const radiusY = 17 + seeded(layoutSeed + 55, i) * 7;

      return {
        x: 50 + Math.cos(angle - Math.PI) * radiusX + jitterX,
        y: 46 + Math.sin(angle - Math.PI) * radiusY + jitterY,
        rotate,
        scale: 0.88 + seeded(layoutSeed + 99, i) * 0.18,
        z: 10 + Math.round(40 - Math.sin(angle) * 10),
        flower,
      };
    });
  }, [flowers, layoutSeed]);

  if (!flowers.length) return null;

  return (
    <div className="flex flex-col items-center">
      <div className={`${sizeMap[size].container} relative`}> 
        <div className={`absolute inset-x-4 -top-3 h-[72%] ${greeneryClassMap[greeneryStyle]} pointer-events-none`}>
          <svg viewBox="0 0 220 190" className="w-full h-full" aria-hidden>
            <g stroke="hsl(var(--foreground) / 0.45)" strokeWidth="2.2" fill="none" strokeLinecap="round">
              <path d="M110 182 C95 132, 86 98, 64 52" />
              <path d="M110 182 C113 131, 132 98, 160 50" />
              <path d="M110 182 C109 130, 106 86, 108 38" />
              {greeneryStyle !== "classic" && <path d="M110 182 C84 132, 54 102, 38 72" />}
              {greeneryStyle === "wild" && <path d="M110 182 C136 138, 172 102, 188 70" />}
            </g>
            <g fill="hsl(var(--muted-foreground) / 0.3)">
              <ellipse cx="59" cy="62" rx="8" ry="18" transform="rotate(-24 59 62)" />
              <ellipse cx="80" cy="83" rx="8" ry="16" transform="rotate(-8 80 83)" />
              <ellipse cx="140" cy="84" rx="8" ry="18" transform="rotate(9 140 84)" />
              <ellipse cx="165" cy="62" rx="8" ry="18" transform="rotate(24 165 62)" />
              {greeneryStyle !== "classic" && (
                <>
                  <ellipse cx="40" cy="80" rx="7" ry="16" transform="rotate(-35 40 80)" />
                  <ellipse cx="180" cy="80" rx="7" ry="16" transform="rotate(35 180 80)" />
                </>
              )}
            </g>
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
