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

/* Generate completely different fan positions per seed */
const generateSlots = (seed: number, count: number) => {
  const slots: { x: number; y: number; z: number }[] = [];
  // Create a unique arrangement each time
  const angleSpread = 55 + seeded(seed, 0) * 30; // 55-85 degree fan spread
  const centerY = 42 + seeded(seed, 1) * 10; // vertical center offset
  const radiusBase = 28 + seeded(seed, 2) * 14; // how far flowers spread

  for (let i = 0; i < count; i++) {
    // Distribute flowers in a fan/dome shape from bottom-center
    const t = count > 1 ? i / (count - 1) : 0.5;
    const angle = (-angleSpread / 2 + t * angleSpread) * (Math.PI / 180);
    
    // Multiple rings - inner flowers closer to center
    const ring = seeded(seed + 50, i * 7) > 0.45 ? 1 : 0;
    const radius = radiusBase * (0.55 + ring * 0.45) * (0.8 + seeded(seed + 30, i * 5) * 0.4);
    
    const baseX = 50 + Math.sin(angle) * radius;
    const baseY = centerY - Math.cos(angle) * radius * 0.7;
    
    // Significant jitter per seed
    const jX = (seeded(seed + 200, i * 3) - 0.5) * 18;
    const jY = (seeded(seed + 300, i * 3 + 1) - 0.5) * 14;

    slots.push({
      x: Math.max(8, Math.min(92, baseX + jX)),
      y: Math.max(6, Math.min(52, baseY + jY)),
      z: 20 + Math.round((1 - (baseY + jY) / 60) * 10),
    });
  }

  // Shuffle the slot assignment order based on seed
  const indices = slots.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(seeded(seed + 999, i) * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.map(i => slots[i]);
};

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
    const sortedGroups = Object.entries(grouped).sort(([a], [b]) => {
      return sizeWeight[getTheme(b).sizeCategory] - sizeWeight[getTheme(a).sizeCategory];
    });

    const ordered = sortedGroups.flatMap(([key, count]) => Array(count).fill(key));
    const total = ordered.length;
    const slots = generateSlots(layoutSeed, total);

    return ordered.map((flower, i) => {
      const slot = slots[i];
      const centerOffset = (slot.x - 50) / 50;
      const tiltBase = centerOffset * 22;
      const tiltJ = (seeded(layoutSeed + 77, i) - 0.5) * 20;
      const rotate = tiltBase + tiltJ;
      const scaleBase = 0.85 + seeded(layoutSeed + 99, i) * 0.25;

      return {
        x: slot.x,
        y: slot.y,
        rotate,
        scale: scaleBase,
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
            {/* Stems converging to gathering point */}
            <StemLines seed={layoutSeed} style={greeneryStyle} />

            {greeneryStyle === "classic" && <ClassicLeaves seed={layoutSeed} />}
            {greeneryStyle === "wild" && <WildLeaves seed={layoutSeed} />}
            {greeneryStyle === "eucalyptus" && <EucalyptusLeaves seed={layoutSeed} />}
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
            <path
              d="M8 6 L36 6 L64 6 L56 56 Q48 60 36 60 Q24 60 16 56 Z"
              fill="hsl(35 40% 78% / 0.85)"
              stroke="hsl(30 25% 55%)"
              strokeWidth="1.2"
            />
            <path d="M14 14 Q36 20, 58 14" fill="none" stroke="hsl(30 20% 60% / 0.5)" strokeWidth="0.8" />
            <path d="M18 28 Q36 32, 54 28" fill="none" stroke="hsl(30 20% 60% / 0.4)" strokeWidth="0.7" />
            <path
              d="M26 12 Q30 6, 36 10 Q42 6, 46 12"
              fill="none" stroke="hsl(28 35% 42%)" strokeWidth="2" strokeLinecap="round"
            />
            <path d="M26 12 Q20 8, 22 14 Q24 18, 28 13" fill="none" stroke="hsl(28 35% 42%)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M46 12 Q52 8, 50 14 Q48 18, 44 13" fill="none" stroke="hsl(28 35% 42%)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M30 13 Q28 20, 26 24" fill="none" stroke="hsl(28 35% 42%)" strokeWidth="1" strokeLinecap="round" />
            <path d="M42 13 Q44 20, 46 24" fill="none" stroke="hsl(28 35% 42%)" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
};

/* ── Seed-driven stem lines ── */
const StemLines = ({ seed, style }: { seed: number; style: string }) => {
  const stems = useMemo(() => {
    const count = style === "wild" ? 9 : 7;
    return Array.from({ length: count }, (_, i) => {
      const spread = 35 + seeded(seed, i * 13) * 25;
      const angle = (-spread + (i / (count - 1)) * spread * 2) * (Math.PI / 180);
      const bendX = 120 + Math.sin(angle) * (60 + seeded(seed + 40, i) * 50);
      const bendY = 80 + seeded(seed + 60, i) * 60;
      const tipX = 120 + Math.sin(angle) * (90 + seeded(seed + 80, i) * 70);
      const tipY = 20 + seeded(seed + 100, i) * 40;
      return `M120 250 Q${bendX.toFixed(0)} ${bendY.toFixed(0)}, ${tipX.toFixed(0)} ${tipY.toFixed(0)}`;
    });
  }, [seed, style]);

  return (
    <g stroke="hsl(132 30% 34%)" strokeWidth="2" fill="none" strokeLinecap="round">
      {stems.map((d, i) => <path key={i} d={d} />)}
    </g>
  );
};

/* ── Greenery sub-components – now seed-driven ── */

const ClassicLeaves = ({ seed }: { seed: number }) => {
  const leaves = useMemo(() => {
    const count = 14;
    return Array.from({ length: count }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const t = i / count;
      const cx = 120 + side * (30 + seeded(seed + 500, i) * 80);
      const cy = 28 + t * 110 + (seeded(seed + 600, i) - 0.5) * 20;
      const rx = 4 + seeded(seed + 700, i) * 4;
      const ry = 10 + seeded(seed + 800, i) * 10;
      const rot = side * (15 + seeded(seed + 900, i) * 40);
      return { cx, cy, rx, ry, rot };
    });
  }, [seed]);

  return (
    <g fill="hsl(138 34% 40% / 0.45)">
      {leaves.map((l, i) => (
        <ellipse
          key={i}
          cx={l.cx}
          cy={l.cy}
          rx={l.rx}
          ry={l.ry}
          transform={`rotate(${l.rot.toFixed(1)} ${l.cx.toFixed(1)} ${l.cy.toFixed(1)})`}
        />
      ))}
    </g>
  );
};

const WildLeaves = ({ seed }: { seed: number }) => {
  const leaves = useMemo(() => {
    const count = 18;
    return Array.from({ length: count }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const t = i / count;
      const cx = 120 + side * (25 + seeded(seed + 1100, i) * 95);
      const cy = 22 + t * 105 + (seeded(seed + 1200, i) - 0.5) * 18;
      const rx = 5 + seeded(seed + 1300, i) * 6;
      const ry = 12 + seeded(seed + 1400, i) * 12;
      const rot = side * (20 + seeded(seed + 1500, i) * 45);
      return { cx, cy, rx, ry, rot };
    });
  }, [seed]);

  const dots = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const cx = 120 + side * (20 + seeded(seed + 2000, i) * 100);
      const cy = 25 + seeded(seed + 2100, i) * 100;
      const r = 1.5 + seeded(seed + 2200, i) * 1.5;
      return { cx, cy, r };
    });
  }, [seed]);

  return (
    <g>
      <g fill="hsl(130 38% 36% / 0.42)">
        {leaves.map((l, i) => (
          <ellipse
            key={i}
            cx={l.cx}
            cy={l.cy}
            rx={l.rx}
            ry={l.ry}
            transform={`rotate(${l.rot.toFixed(1)} ${l.cx.toFixed(1)} ${l.cy.toFixed(1)})`}
          />
        ))}
      </g>
      <g fill="hsl(0 0% 96% / 0.55)">
        {dots.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={d.r} />
        ))}
      </g>
    </g>
  );
};

const EucalyptusLeaves = ({ seed }: { seed: number }) => {
  const branches = useMemo(() => {
    const count = 6;
    return Array.from({ length: count }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const startX = 120 + side * (20 + seeded(seed + 3000, i) * 40);
      const startY = 30 + seeded(seed + 3100, i) * 20;
      const endX = startX + side * (30 + seeded(seed + 3200, i) * 50);
      const endY = startY + 50 + seeded(seed + 3300, i) * 50;
      const midX = (startX + endX) / 2 + side * seeded(seed + 3400, i) * 20;
      const midY = (startY + endY) / 2;
      return { d: `M${startX.toFixed(0)} ${startY.toFixed(0)} Q${midX.toFixed(0)} ${midY.toFixed(0)}, ${endX.toFixed(0)} ${endY.toFixed(0)}`, startX, startY, endX, endY };
    });
  }, [seed]);

  const circles = useMemo(() => {
    const result: { cx: number; cy: number; r: number }[] = [];
    branches.forEach((b, bi) => {
      const steps = 4 + Math.floor(seeded(seed + 3500, bi) * 3);
      for (let j = 0; j < steps; j++) {
        const t = (j + 1) / (steps + 1);
        const cx = b.startX + (b.endX - b.startX) * t + (seeded(seed + 3600, bi * 10 + j) - 0.5) * 8;
        const cy = b.startY + (b.endY - b.startY) * t + (seeded(seed + 3700, bi * 10 + j) - 0.5) * 6;
        const r = 4 + seeded(seed + 3800, bi * 10 + j) * 4;
        result.push({ cx, cy, r });
      }
    });
    return result;
  }, [seed, branches]);

  return (
    <g>
      <g stroke="hsl(155 24% 42%)" strokeWidth="1.4" fill="none" strokeLinecap="round">
        {branches.map((b, i) => <path key={i} d={b.d} />)}
      </g>
      <g fill="hsl(158 32% 46% / 0.38)">
        {circles.map((c, i) => <circle key={i} cx={c.cx} cy={c.cy} r={c.r} />)}
      </g>
    </g>
  );
};

export default BouquetArrangement;
