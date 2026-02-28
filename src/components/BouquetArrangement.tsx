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

const seeded = (seed: number, n: number) => {
  const x = Math.sin(seed * 97.11 + n * 41.23) * 10000;
  return x - Math.floor(x);
};

/* ── Dome slots: concentric rings from center outward ── */
const domeSlots = [
  // Ring 0 – center hero
  { x: 50, y: 30, z: 30 },
  // Ring 1 – inner ring
  { x: 38, y: 26, z: 26 },
  { x: 62, y: 26, z: 26 },
  { x: 44, y: 38, z: 28 },
  { x: 56, y: 38, z: 28 },
  // Ring 2 – outer fill
  { x: 28, y: 30, z: 20 },
  { x: 72, y: 30, z: 20 },
  { x: 34, y: 42, z: 22 },
  { x: 66, y: 42, z: 22 },
  { x: 50, y: 44, z: 24 },
];

const BouquetArrangement = ({
  flowers,
  size = "md",
  layoutSeed = 7,
  greeneryStyle = "classic",
}: BouquetArrangementProps) => {
  const positions = useMemo(() => {
    if (!flowers.length) return [];

    // Group identical flowers together so same types cluster
    const grouped: Record<string, number> = {};
    flowers.forEach((f) => (grouped[f] = (grouped[f] || 0) + 1));

    // Sort groups: largest flowers first (center), then by count descending
    const sizeWeight = { large: 3, medium: 2, small: 1 } as const;
    const sortedGroups = Object.entries(grouped).sort(([a, countA], [b, countB]) => {
      const diff = sizeWeight[getTheme(b).sizeCategory] - sizeWeight[getTheme(a).sizeCategory];
      return diff !== 0 ? diff : countB - countA;
    });

    // Flatten keeping groups adjacent so same flowers sit next to each other
    const ordered = sortedGroups.flatMap(([key, count]) => Array(count).fill(key));
    const total = ordered.length;

    return ordered.map((flower, i) => {
      const slot = domeSlots[i % domeSlots.length];
      const jX = (seeded(layoutSeed, i * 3) - 0.5) * 5;
      const jY = (seeded(layoutSeed + 11, i * 3) - 0.5) * 4;
      const rotate = (seeded(layoutSeed + 77, i) - 0.5) * 22;
      const scaleBase = i < 2 ? 1.08 : i < 5 ? 0.97 : 0.9;
      const scaleJ = (seeded(layoutSeed + 99, i) - 0.5) * 0.08;

      return {
        x: slot.x + jX,
        y: slot.y + jY,
        rotate,
        scale: scaleBase + scaleJ,
        z: slot.z + (total - i), // earlier = higher z
        flower,
      };
    });
  }, [flowers, layoutSeed]);

  if (!flowers.length) return null;

  return (
    <div className="flex flex-col items-center">
      <div className={`${sizeMap[size].container} relative`}>
        {/* ── Greenery SVG layer ── */}
        <div className="absolute inset-x-0 top-0 h-[88%] pointer-events-none">
          <svg viewBox="0 0 240 210" className="w-full h-full" aria-hidden>
            {/* Stems – organic curves */}
            <g stroke="hsl(132 30% 34%)" strokeWidth="2.2" fill="none" strokeLinecap="round">
              <path d="M120 200 Q110 155, 68 55" />
              <path d="M120 200 Q130 155, 172 55" />
              <path d="M120 200 Q118 148, 120 40" />
              <path d="M120 200 Q104 145, 52 72" />
              <path d="M120 200 Q136 145, 188 72" />
              {greeneryStyle === "wild" && (
                <>
                  <path d="M120 200 Q90 140, 36 58" />
                  <path d="M120 200 Q150 140, 204 58" />
                </>
              )}
            </g>

            {greeneryStyle === "classic" && <ClassicLeaves />}
            {greeneryStyle === "wild" && <WildLeaves />}
            {greeneryStyle === "eucalyptus" && <EucalyptusLeaves />}
          </svg>
        </div>

        {/* ── Flowers ── */}
        {positions.map((pos, i) => (
          <div
            key={`${pos.flower}-${i}`}
            className="absolute transition-transform duration-300"
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

        {/* ── Wrap / vase ── */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30">
          <svg width="80" height="74" viewBox="0 0 80 74" aria-hidden>
            <path
              d="M10 10 Q14 4 26 4 L54 4 Q66 4 70 10 L56 68 Q52 72 40 72 Q28 72 24 68 Z"
              fill="hsl(var(--muted) / 0.8)"
              stroke="hsl(var(--border))"
              strokeWidth="1.4"
            />
            {/* Ribbon */}
            <path
              d="M18 18 Q40 24, 62 18"
              fill="none"
              stroke="hsl(var(--foreground) / 0.25)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

/* ── Greenery sub-components ── */

const ClassicLeaves = () => (
  <g fill="hsl(138 34% 40% / 0.5)">
    {/* Left side leaves */}
    <ellipse cx="58" cy="58" rx="8" ry="22" transform="rotate(-30 58 58)" />
    <ellipse cx="48" cy="78" rx="6" ry="16" transform="rotate(-40 48 78)" />
    <ellipse cx="72" cy="82" rx="5" ry="14" transform="rotate(-8 72 82)" />
    {/* Right side leaves */}
    <ellipse cx="182" cy="58" rx="8" ry="22" transform="rotate(30 182 58)" />
    <ellipse cx="192" cy="78" rx="6" ry="16" transform="rotate(40 192 78)" />
    <ellipse cx="168" cy="82" rx="5" ry="14" transform="rotate(10 168 82)" />
    {/* Top accent */}
    <ellipse cx="120" cy="42" rx="5" ry="18" transform="rotate(2 120 42)" />
    {/* Mid fillers */}
    <ellipse cx="88" cy="92" rx="5" ry="13" transform="rotate(-6 88 92)" />
    <ellipse cx="152" cy="94" rx="5" ry="13" transform="rotate(8 152 94)" />
    {/* Small accent sprigs */}
    <ellipse cx="64" cy="96" rx="3.5" ry="10" transform="rotate(-20 64 96)" />
    <ellipse cx="176" cy="96" rx="3.5" ry="10" transform="rotate(22 176 96)" />
  </g>
);

const WildLeaves = () => (
  <g fill="hsl(130 38% 36% / 0.45)">
    {/* Abundant foliage – left */}
    <ellipse cx="32" cy="60" rx="10" ry="24" transform="rotate(-42 32 60)" />
    <ellipse cx="50" cy="52" rx="8" ry="20" transform="rotate(-26 50 52)" />
    <ellipse cx="44" cy="80" rx="7" ry="16" transform="rotate(-35 44 80)" />
    <ellipse cx="62" cy="96" rx="5" ry="12" transform="rotate(-18 62 96)" />
    {/* Right */}
    <ellipse cx="208" cy="60" rx="10" ry="24" transform="rotate(42 208 60)" />
    <ellipse cx="190" cy="52" rx="8" ry="20" transform="rotate(26 190 52)" />
    <ellipse cx="196" cy="80" rx="7" ry="16" transform="rotate(35 196 80)" />
    <ellipse cx="178" cy="96" rx="5" ry="12" transform="rotate(20 178 96)" />
    {/* Center */}
    <ellipse cx="120" cy="38" rx="6" ry="20" />
    <ellipse cx="74" cy="72" rx="7" ry="17" transform="rotate(-10 74 72)" />
    <ellipse cx="166" cy="72" rx="7" ry="17" transform="rotate(12 166 72)" />
    {/* Wispy extras */}
    <ellipse cx="90" cy="90" rx="5" ry="12" transform="rotate(-5 90 90)" />
    <ellipse cx="150" cy="92" rx="5" ry="12" transform="rotate(6 150 92)" />
    {/* Baby's breath dots */}
    <circle cx="40" cy="50" r="2.5" fill="hsl(0 0% 96% / 0.6)" />
    <circle cx="200" cy="50" r="2.5" fill="hsl(0 0% 96% / 0.6)" />
    <circle cx="56" cy="68" r="2" fill="hsl(0 0% 96% / 0.5)" />
    <circle cx="184" cy="68" r="2" fill="hsl(0 0% 96% / 0.5)" />
    <circle cx="80" cy="88" r="1.8" fill="hsl(0 0% 96% / 0.45)" />
    <circle cx="160" cy="86" r="1.8" fill="hsl(0 0% 96% / 0.45)" />
  </g>
);

const EucalyptusLeaves = () => (
  <g>
    {/* Branches */}
    <g stroke="hsl(155 24% 42%)" strokeWidth="1.6" fill="none" strokeLinecap="round">
      <path d="M56 48 Q48 68, 38 98" />
      <path d="M184 48 Q192 68, 202 98" />
      <path d="M88 56 Q80 76, 72 106" />
      <path d="M152 56 Q160 76, 168 106" />
      <path d="M120 36 Q118 56, 116 80" />
    </g>
    {/* Round coin leaves */}
    <g fill="hsl(158 32% 46% / 0.42)">
      {/* Left branch */}
      <circle cx="54" cy="50" r="7.5" />
      <circle cx="48" cy="66" r="7" />
      <circle cx="43" cy="82" r="6.5" />
      <circle cx="39" cy="96" r="6" />
      {/* Right branch */}
      <circle cx="186" cy="50" r="7.5" />
      <circle cx="192" cy="66" r="7" />
      <circle cx="197" cy="82" r="6.5" />
      <circle cx="201" cy="96" r="6" />
      {/* Inner left */}
      <circle cx="86" cy="58" r="6.5" />
      <circle cx="82" cy="74" r="6" />
      <circle cx="77" cy="88" r="5.5" />
      <circle cx="73" cy="102" r="5" />
      {/* Inner right */}
      <circle cx="154" cy="58" r="6.5" />
      <circle cx="158" cy="74" r="6" />
      <circle cx="163" cy="88" r="5.5" />
      <circle cx="167" cy="102" r="5" />
      {/* Center branch */}
      <circle cx="120" cy="38" r="6" />
      <circle cx="119" cy="54" r="5.5" />
      <circle cx="117" cy="70" r="5" />
    </g>
  </g>
);

export default BouquetArrangement;
