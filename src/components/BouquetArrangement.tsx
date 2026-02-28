import { useMemo } from "react";
import FlowerEmoji, { getTheme } from "@/components/FlowerEmoji";

interface BouquetArrangementProps {
  flowers: string[];
  size?: "sm" | "md" | "lg";
  layoutSeed?: number;
  greeneryStyle?: "classic" | "wild" | "eucalyptus";
}

const sizeMap = {
  sm: { container: "w-56 h-64", flower: 48 },
  md: { container: "w-72 h-80", flower: 58 },
  lg: { container: "w-80 h-[22rem]", flower: 68 },
};

const seeded = (seed: number, n: number) => {
  const x = Math.sin(seed * 97.11 + n * 41.23) * 10000;
  return x - Math.floor(x);
};

/* ── Fan-shaped bouquet slots: flowers fan upward & outward ── */
const bouquetSlots = [
  // Top tier – crown flowers fanning out
  { x: 50, y: 14, z: 30 },
  { x: 34, y: 18, z: 28 },
  { x: 66, y: 18, z: 28 },
  // Mid tier – filling out the fan
  { x: 22, y: 26, z: 24 },
  { x: 42, y: 24, z: 26 },
  { x: 58, y: 24, z: 26 },
  { x: 78, y: 26, z: 24 },
  // Lower tier – near the gathering point
  { x: 30, y: 34, z: 22 },
  { x: 50, y: 32, z: 25 },
  { x: 70, y: 34, z: 22 },
];

const BouquetArrangement = ({
  flowers,
  size = "md",
  layoutSeed = 7,
  greeneryStyle = "classic",
}: BouquetArrangementProps) => {
  const positions = useMemo(() => {
    if (!flowers.length) return [];

    // Group identical flowers so same types cluster
    const grouped: Record<string, number> = {};
    flowers.forEach((f) => (grouped[f] = (grouped[f] || 0) + 1));

    const sizeWeight = { large: 3, medium: 2, small: 1 } as const;
    const sortedGroups = Object.entries(grouped).sort(([a, countA], [b, countB]) => {
      const diff = sizeWeight[getTheme(b).sizeCategory] - sizeWeight[getTheme(a).sizeCategory];
      return diff !== 0 ? diff : countB - countA;
    });

    const ordered = sortedGroups.flatMap(([key, count]) => Array(count).fill(key));
    const total = ordered.length;

    return ordered.map((flower, i) => {
      const slot = bouquetSlots[i % bouquetSlots.length];
      const jX = (seeded(layoutSeed, i * 3) - 0.5) * 6;
      const jY = (seeded(layoutSeed + 11, i * 3) - 0.5) * 5;
      // Flowers tilt outward from center for a fan effect
      const centerOffset = (slot.x - 50) / 50; // -1 to 1
      const tiltBase = centerOffset * 18;
      const tiltJ = (seeded(layoutSeed + 77, i) - 0.5) * 14;
      const rotate = tiltBase + tiltJ;
      const scaleBase = i < 3 ? 1.05 : i < 7 ? 0.95 : 0.88;
      const scaleJ = (seeded(layoutSeed + 99, i) - 0.5) * 0.08;

      return {
        x: slot.x + jX,
        y: slot.y + jY,
        rotate,
        scale: scaleBase + scaleJ,
        z: slot.z + (total - i),
        flower,
      };
    });
  }, [flowers, layoutSeed]);

  if (!flowers.length) return null;

  return (
    <div className="flex flex-col items-center">
      <div className={`${sizeMap[size].container} relative`}>
        {/* ── Greenery SVG layer ── */}
        <div className="absolute inset-0 pointer-events-none">
          <svg viewBox="0 0 240 260" className="w-full h-full" aria-hidden>
            {/* Stems converging to a gathering point */}
            <g stroke="hsl(132 30% 34%)" strokeWidth="2" fill="none" strokeLinecap="round">
              <path d="M120 250 Q108 180, 58 40" />
              <path d="M120 250 Q132 180, 182 40" />
              <path d="M120 250 Q116 175, 120 25" />
              <path d="M120 250 Q100 170, 38 55" />
              <path d="M120 250 Q140 170, 202 55" />
              <path d="M120 250 Q112 185, 80 30" />
              <path d="M120 250 Q128 185, 160 30" />
              {greeneryStyle === "wild" && (
                <>
                  <path d="M120 250 Q85 160, 24 38" />
                  <path d="M120 250 Q155 160, 216 38" />
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

        {/* ── Wrap / tie point ── */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-30">
          <svg width="72" height="60" viewBox="0 0 72 60" aria-hidden>
            {/* Kraft paper wrap – triangular, open top */}
            <path
              d="M8 6 L36 6 L64 6 L56 56 Q48 60 36 60 Q24 60 16 56 Z"
              fill="hsl(35 40% 78% / 0.85)"
              stroke="hsl(30 25% 55%)"
              strokeWidth="1.2"
            />
            {/* Wrap texture lines */}
            <path d="M14 14 Q36 20, 58 14" fill="none" stroke="hsl(30 20% 60% / 0.5)" strokeWidth="0.8" />
            <path d="M18 28 Q36 32, 54 28" fill="none" stroke="hsl(30 20% 60% / 0.4)" strokeWidth="0.7" />
            {/* Twine bow */}
            <path
              d="M26 12 Q30 6, 36 10 Q42 6, 46 12"
              fill="none"
              stroke="hsl(28 35% 42%)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Bow loops */}
            <path
              d="M26 12 Q20 8, 22 14 Q24 18, 28 13"
              fill="none"
              stroke="hsl(28 35% 42%)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M46 12 Q52 8, 50 14 Q48 18, 44 13"
              fill="none"
              stroke="hsl(28 35% 42%)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Dangling twine ends */}
            <path d="M30 13 Q28 20, 26 24" fill="none" stroke="hsl(28 35% 42%)" strokeWidth="1" strokeLinecap="round" />
            <path d="M42 13 Q44 20, 46 24" fill="none" stroke="hsl(28 35% 42%)" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
};

/* ── Greenery sub-components – cascading around the bouquet fan ── */

const ClassicLeaves = () => (
  <g fill="hsl(138 34% 40% / 0.45)">
    {/* Left cascading leaves */}
    <ellipse cx="48" cy="44" rx="6" ry="18" transform="rotate(-35 48 44)" />
    <ellipse cx="36" cy="65" rx="5" ry="15" transform="rotate(-42 36 65)" />
    <ellipse cx="55" cy="80" rx="5" ry="13" transform="rotate(-20 55 80)" />
    <ellipse cx="42" cy="100" rx="4" ry="12" transform="rotate(-50 42 100)" />
    {/* Right cascading leaves */}
    <ellipse cx="192" cy="44" rx="6" ry="18" transform="rotate(35 192 44)" />
    <ellipse cx="204" cy="65" rx="5" ry="15" transform="rotate(42 204 65)" />
    <ellipse cx="185" cy="80" rx="5" ry="13" transform="rotate(20 185 80)" />
    <ellipse cx="198" cy="100" rx="4" ry="12" transform="rotate(50 198 100)" />
    {/* Top crown accent */}
    <ellipse cx="120" cy="28" rx="4" ry="16" transform="rotate(3 120 28)" />
    <ellipse cx="90" cy="34" rx="5" ry="14" transform="rotate(-15 90 34)" />
    <ellipse cx="150" cy="34" rx="5" ry="14" transform="rotate(15 150 34)" />
    {/* Inner fill */}
    <ellipse cx="75" cy="60" rx="4.5" ry="12" transform="rotate(-25 75 60)" />
    <ellipse cx="165" cy="60" rx="4.5" ry="12" transform="rotate(25 165 60)" />
    {/* Lower draping leaves */}
    <ellipse cx="60" cy="120" rx="4" ry="11" transform="rotate(-55 60 120)" />
    <ellipse cx="180" cy="120" rx="4" ry="11" transform="rotate(55 180 120)" />
  </g>
);

const WildLeaves = () => (
  <g>
    <g fill="hsl(130 38% 36% / 0.42)">
      {/* Left wild spray */}
      <ellipse cx="28" cy="42" rx="9" ry="22" transform="rotate(-48 28 42)" />
      <ellipse cx="42" cy="55" rx="7" ry="18" transform="rotate(-30 42 55)" />
      <ellipse cx="34" cy="78" rx="6" ry="15" transform="rotate(-55 34 78)" />
      <ellipse cx="50" cy="95" rx="5" ry="13" transform="rotate(-38 50 95)" />
      <ellipse cx="38" cy="115" rx="4.5" ry="12" transform="rotate(-60 38 115)" />
      {/* Right wild spray */}
      <ellipse cx="212" cy="42" rx="9" ry="22" transform="rotate(48 212 42)" />
      <ellipse cx="198" cy="55" rx="7" ry="18" transform="rotate(30 198 55)" />
      <ellipse cx="206" cy="78" rx="6" ry="15" transform="rotate(55 206 78)" />
      <ellipse cx="190" cy="95" rx="5" ry="13" transform="rotate(38 190 95)" />
      <ellipse cx="202" cy="115" rx="4.5" ry="12" transform="rotate(60 202 115)" />
      {/* Center crown */}
      <ellipse cx="120" cy="22" rx="5" ry="18" />
      <ellipse cx="80" cy="38" rx="6" ry="16" transform="rotate(-18 80 38)" />
      <ellipse cx="160" cy="38" rx="6" ry="16" transform="rotate(18 160 38)" />
      {/* Inner fillers */}
      <ellipse cx="100" cy="68" rx="5" ry="14" transform="rotate(-10 100 68)" />
      <ellipse cx="140" cy="68" rx="5" ry="14" transform="rotate(10 140 68)" />
    </g>
    {/* Baby's breath dots scattered through the arrangement */}
    <g fill="hsl(0 0% 96% / 0.55)">
      <circle cx="30" cy="36" r="2.5" />
      <circle cx="210" cy="36" r="2.5" />
      <circle cx="50" cy="48" r="2" />
      <circle cx="190" cy="48" r="2" />
      <circle cx="38" cy="70" r="1.8" />
      <circle cx="202" cy="70" r="1.8" />
      <circle cx="68" cy="30" r="2" />
      <circle cx="172" cy="30" r="2" />
      <circle cx="55" cy="110" r="1.5" />
      <circle cx="185" cy="110" r="1.5" />
    </g>
  </g>
);

const EucalyptusLeaves = () => (
  <g>
    {/* Branches draping outward */}
    <g stroke="hsl(155 24% 42%)" strokeWidth="1.4" fill="none" strokeLinecap="round">
      <path d="M54 36 Q42 65, 30 105" />
      <path d="M186 36 Q198 65, 210 105" />
      <path d="M78 42 Q68 70, 55 110" />
      <path d="M162 42 Q172 70, 185 110" />
      <path d="M120 24 Q118 50, 115 80" />
      {/* Draping strands */}
      <path d="M46 70 Q36 100, 28 135" />
      <path d="M194 70 Q204 100, 212 135" />
    </g>
    {/* Round coin leaves along branches */}
    <g fill="hsl(158 32% 46% / 0.38)">
      {/* Left outer branch */}
      <circle cx="50" cy="40" r="7" />
      <circle cx="44" cy="56" r="6.5" />
      <circle cx="38" cy="72" r="6" />
      <circle cx="33" cy="88" r="5.5" />
      <circle cx="30" cy="102" r="5" />
      {/* Right outer branch */}
      <circle cx="190" cy="40" r="7" />
      <circle cx="196" cy="56" r="6.5" />
      <circle cx="202" cy="72" r="6" />
      <circle cx="207" cy="88" r="5.5" />
      <circle cx="210" cy="102" r="5" />
      {/* Left inner */}
      <circle cx="76" cy="44" r="6" />
      <circle cx="70" cy="60" r="5.5" />
      <circle cx="64" cy="76" r="5" />
      <circle cx="58" cy="92" r="4.5" />
      {/* Right inner */}
      <circle cx="164" cy="44" r="6" />
      <circle cx="170" cy="60" r="5.5" />
      <circle cx="176" cy="76" r="5" />
      <circle cx="182" cy="92" r="4.5" />
      {/* Center */}
      <circle cx="120" cy="26" r="5.5" />
      <circle cx="118" cy="42" r="5" />
      <circle cx="116" cy="58" r="4.5" />
      {/* Draping leaves */}
      <circle cx="42" cy="78" r="5" />
      <circle cx="36" cy="94" r="4.5" />
      <circle cx="30" cy="110" r="4" />
      <circle cx="198" cy="78" r="5" />
      <circle cx="204" cy="94" r="4.5" />
      <circle cx="210" cy="110" r="4" />
    </g>
  </g>
);

export default BouquetArrangement;
