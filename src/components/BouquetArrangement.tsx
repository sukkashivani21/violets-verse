import { useMemo } from "react";
import FlowerEmoji, { getTheme } from "@/components/FlowerEmoji";

interface BouquetArrangementProps {
  flowers: string[];
  size?: "sm" | "md" | "lg";
  layoutSeed?: number;
  greeneryStyle?: "classic" | "wild" | "eucalyptus";
}

const sizeMap = {
  sm: { container: "w-56 h-64", flower: 44 },
  md: { container: "w-72 h-80", flower: 54 },
  lg: { container: "w-80 h-[22rem]", flower: 64 },
};

const seeded = (seed: number, n: number) => {
  const x = Math.sin(seed * 97.11 + n * 41.23) * 10000;
  return x - Math.floor(x);
};

/**
 * Generate a proper bouquet dome layout.
 * Flowers sit in concentric arcs radiating upward from a single gathering point.
 */
const generateBouquetSlots = (seed: number, count: number) => {
  const slots: { x: number; y: number; z: number }[] = [];

  // Gathering point at bottom-center
  const gatherX = 50;
  const gatherY = 72;

  // Determine ring counts: center flower, then expanding rings
  const rings: number[] = [];
  let remaining = count;
  let ringSize = 1;
  while (remaining > 0) {
    const n = Math.min(remaining, ringSize);
    rings.push(n);
    remaining -= n;
    ringSize += 2 + Math.floor(seeded(seed + 10, rings.length) * 2);
  }

  let idx = 0;
  rings.forEach((ringCount, ringIdx) => {
    const radius = ringIdx * (14 + seeded(seed, ringIdx) * 6);
    const fanAngle = 140 + seeded(seed + 1, 0) * 30; // wide fan
    const startAngle = -(fanAngle / 2);

    for (let i = 0; i < ringCount; i++) {
      const t = ringCount > 1 ? i / (ringCount - 1) : 0.5;
      const angle = (startAngle + t * fanAngle) * (Math.PI / 180);

      // Fan upward from gather point
      const baseX = gatherX + Math.sin(angle) * radius;
      const baseY = gatherY - Math.cos(angle) * radius * 0.85 - ringIdx * 4;

      // Seed-based jitter for organic feel
      const jX = (seeded(seed + 200, idx * 3) - 0.5) * 8;
      const jY = (seeded(seed + 300, idx * 3 + 1) - 0.5) * 6;

      slots.push({
        x: Math.max(10, Math.min(90, baseX + jX)),
        y: Math.max(5, Math.min(60, baseY + jY)),
        z: 20 + ringIdx * 3 + Math.round(seeded(seed + 400, idx) * 5),
      });
      idx++;
    }
  });

  // Shuffle assignment by seed
  const indices = slots.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(seeded(seed + 999, i) * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.map((i) => slots[i]);
};

/* ── SVG leaf path generator ── */
const makeLeafPath = (
  cx: number,
  cy: number,
  length: number,
  width: number,
  angle: number
) => {
  // A pointed leaf shape: tip at top, base at bottom, with a slight curve
  // We draw relative to origin then rotate
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const rotate = (px: number, py: number) => ({
    x: cx + px * cos - py * sin,
    y: cy + px * sin + py * cos,
  });

  const tip = rotate(0, -length);
  const leftMid = rotate(-width, -length * 0.45);
  const rightMid = rotate(width, -length * 0.45);
  const base = rotate(0, 0);
  const leftCtrl1 = rotate(-width * 0.3, -length * 0.85);
  const rightCtrl1 = rotate(width * 0.3, -length * 0.85);
  const leftCtrl2 = rotate(-width * 0.8, -length * 0.15);
  const rightCtrl2 = rotate(width * 0.8, -length * 0.15);

  const leafD = [
    `M${base.x.toFixed(1)} ${base.y.toFixed(1)}`,
    `C${leftCtrl2.x.toFixed(1)} ${leftCtrl2.y.toFixed(1)}, ${leftMid.x.toFixed(1)} ${leftMid.y.toFixed(1)}, ${leftCtrl1.x.toFixed(1)} ${leftCtrl1.y.toFixed(1)}`,
    `Q${tip.x.toFixed(1)} ${tip.y.toFixed(1)}, ${tip.x.toFixed(1)} ${tip.y.toFixed(1)}`,
    `Q${tip.x.toFixed(1)} ${tip.y.toFixed(1)}, ${rightCtrl1.x.toFixed(1)} ${rightCtrl1.y.toFixed(1)}`,
    `C${rightMid.x.toFixed(1)} ${rightMid.y.toFixed(1)}, ${rightCtrl2.x.toFixed(1)} ${rightCtrl2.y.toFixed(1)}, ${base.x.toFixed(1)} ${base.y.toFixed(1)}`,
    "Z",
  ].join(" ");

  // Midrib line
  const midTop = rotate(0, -length * 0.92);
  const midribD = `M${base.x.toFixed(1)} ${base.y.toFixed(1)} L${midTop.x.toFixed(1)} ${midTop.y.toFixed(1)}`;

  // Vein lines (3 pairs)
  const veins: string[] = [];
  for (let v = 0; v < 3; v++) {
    const t = 0.25 + v * 0.22;
    const midPt = rotate(0, -length * t);
    const leftVein = rotate(-width * 0.65, -length * (t + 0.1));
    const rightVein = rotate(width * 0.65, -length * (t + 0.1));
    veins.push(`M${midPt.x.toFixed(1)} ${midPt.y.toFixed(1)} Q${leftVein.x.toFixed(1)} ${leftVein.y.toFixed(1)}, ${leftVein.x.toFixed(1)} ${leftVein.y.toFixed(1)}`);
    veins.push(`M${midPt.x.toFixed(1)} ${midPt.y.toFixed(1)} Q${rightVein.x.toFixed(1)} ${rightVein.y.toFixed(1)}, ${rightVein.x.toFixed(1)} ${rightVein.y.toFixed(1)}`);
  }

  return { leafD, midribD, veinsD: veins.join(" ") };
};

const BouquetArrangement = ({
  flowers,
  size = "md",
  layoutSeed = 7,
  greeneryStyle = "classic",
}: BouquetArrangementProps) => {
  const positions = useMemo(() => {
    if (!flowers.length) return [];

    // Group identical flowers for clustering
    const grouped: Record<string, number> = {};
    flowers.forEach((f) => (grouped[f] = (grouped[f] || 0) + 1));

    const sizeWeight = { large: 3, medium: 2, small: 1 } as const;
    const sortedGroups = Object.entries(grouped).sort(([a], [b]) => {
      return (
        sizeWeight[getTheme(b).sizeCategory] -
        sizeWeight[getTheme(a).sizeCategory]
      );
    });

    const ordered = sortedGroups.flatMap(([key, count]) =>
      Array(count).fill(key)
    );
    const total = ordered.length;
    const slots = generateBouquetSlots(layoutSeed, total);

    return ordered.map((flower, i) => {
      const slot = slots[i];
      const centerOffset = (slot.x - 50) / 50;
      const tiltBase = centerOffset * 18;
      const tiltJ = (seeded(layoutSeed + 77, i) - 0.5) * 14;
      const rotate = tiltBase + tiltJ;
      const scaleBase = 0.88 + seeded(layoutSeed + 99, i) * 0.2;

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
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
          <svg viewBox="0 0 240 280" className="w-full h-full" aria-hidden>
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
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30">
          <svg width="80" height="64" viewBox="0 0 80 64" aria-hidden>
            {/* Paper wrap */}
            <path
              d="M10 4 L40 4 L70 4 L62 58 Q52 64 40 64 Q28 64 18 58 Z"
              fill="hsl(35 40% 82% / 0.9)"
              stroke="hsl(30 25% 58%)"
              strokeWidth="1"
            />
            {/* Texture lines */}
            <path d="M16 14 Q40 20, 64 14" fill="none" stroke="hsl(30 20% 65% / 0.4)" strokeWidth="0.6" />
            <path d="M20 30 Q40 34, 60 30" fill="none" stroke="hsl(30 20% 65% / 0.3)" strokeWidth="0.5" />
            {/* Ribbon bow */}
            <path
              d="M30 10 Q34 4, 40 8 Q46 4, 50 10"
              fill="none" stroke="hsl(340 45% 55%)" strokeWidth="2.2" strokeLinecap="round"
            />
            <path d="M30 10 Q24 6, 26 12 Q28 16, 32 11" fill="none" stroke="hsl(340 45% 55%)" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M50 10 Q56 6, 54 12 Q52 16, 48 11" fill="none" stroke="hsl(340 45% 55%)" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="40" cy="9" r="1.8" fill="hsl(340 45% 55%)" />
          </svg>
        </div>
      </div>
    </div>
  );
};

/* ── Seed-driven stems ── */
const StemLines = ({ seed, style }: { seed: number; style: string }) => {
  const stems = useMemo(() => {
    const count = style === "wild" ? 10 : 8;
    return Array.from({ length: count }, (_, i) => {
      const spread = 40 + seeded(seed, i * 13) * 30;
      const angle =
        (-spread + (i / (count - 1)) * spread * 2) * (Math.PI / 180);
      const bendX = 120 + Math.sin(angle) * (55 + seeded(seed + 40, i) * 45);
      const bendY = 100 + seeded(seed + 60, i) * 50;
      const tipX = 120 + Math.sin(angle) * (80 + seeded(seed + 80, i) * 60);
      const tipY = 15 + seeded(seed + 100, i) * 35;
      return `M120 260 Q${bendX.toFixed(0)} ${bendY.toFixed(0)}, ${tipX.toFixed(0)} ${tipY.toFixed(0)}`;
    });
  }, [seed, style]);

  return (
    <g stroke="hsl(128 32% 32%)" strokeWidth="2.2" fill="none" strokeLinecap="round">
      {stems.map((d, i) => (
        <path key={i} d={d} opacity={0.7 + seeded(seed, i + 50) * 0.3} />
      ))}
    </g>
  );
};

/* ── Realistic leaf shapes with midrib & veins ── */

const ClassicLeaves = ({ seed }: { seed: number }) => {
  const leaves = useMemo(() => {
    const count = 16;
    return Array.from({ length: count }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const t = i / count;
      const cx = 120 + side * (35 + seeded(seed + 500, i) * 70);
      const cy = 20 + t * 130 + (seeded(seed + 600, i) - 0.5) * 20;
      const length = 18 + seeded(seed + 700, i) * 18;
      const width = 5 + seeded(seed + 800, i) * 5;
      const angle = side * (25 + seeded(seed + 900, i) * 50);
      const shade = 34 + seeded(seed + 950, i) * 16; // vary green shade
      return { cx, cy, length, width, angle, shade };
    });
  }, [seed]);

  return (
    <g>
      {leaves.map((l, i) => {
        const { leafD, midribD, veinsD } = makeLeafPath(l.cx, l.cy, l.length, l.width, l.angle);
        return (
          <g key={i}>
            <path d={leafD} fill={`hsl(130 ${l.shade}% 38% / 0.55)`} stroke="hsl(130 30% 28% / 0.4)" strokeWidth="0.6" />
            <path d={midribD} stroke="hsl(130 25% 30% / 0.5)" strokeWidth="0.5" fill="none" />
            <path d={veinsD} stroke="hsl(130 20% 35% / 0.3)" strokeWidth="0.3" fill="none" />
          </g>
        );
      })}
    </g>
  );
};

const WildLeaves = ({ seed }: { seed: number }) => {
  const leaves = useMemo(() => {
    const count = 20;
    return Array.from({ length: count }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const t = i / count;
      const cx = 120 + side * (30 + seeded(seed + 1100, i) * 85);
      const cy = 15 + t * 120 + (seeded(seed + 1200, i) - 0.5) * 16;
      const length = 14 + seeded(seed + 1300, i) * 20;
      const width = 4 + seeded(seed + 1400, i) * 5;
      const angle = side * (20 + seeded(seed + 1500, i) * 55);
      const shade = 30 + seeded(seed + 1550, i) * 20;
      return { cx, cy, length, width, angle, shade };
    });
  }, [seed]);

  // Tall grass-like blades
  const blades = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const baseX = 120 + side * (10 + seeded(seed + 2500, i) * 30);
      const tipX = baseX + side * (20 + seeded(seed + 2600, i) * 40);
      const tipY = 5 + seeded(seed + 2700, i) * 20;
      const ctrlX = (baseX + tipX) / 2 + side * seeded(seed + 2800, i) * 15;
      return `M${baseX.toFixed(0)} 250 Q${ctrlX.toFixed(0)} 120, ${tipX.toFixed(0)} ${tipY.toFixed(0)}`;
    });
  }, [seed]);

  // Baby's breath clusters
  const dots = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const cx = 120 + side * (25 + seeded(seed + 2000, i) * 90);
      const cy = 15 + seeded(seed + 2100, i) * 90;
      const r = 1.2 + seeded(seed + 2200, i) * 1.8;
      return { cx, cy, r };
    });
  }, [seed]);

  return (
    <g>
      {/* Tall grass blades */}
      <g stroke="hsl(118 35% 40%)" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.5">
        {blades.map((d, i) => <path key={`b${i}`} d={d} />)}
      </g>
      {/* Leaves */}
      {leaves.map((l, i) => {
        const { leafD, midribD } = makeLeafPath(l.cx, l.cy, l.length, l.width, l.angle);
        return (
          <g key={i}>
            <path d={leafD} fill={`hsl(125 ${l.shade}% 36% / 0.5)`} stroke="hsl(125 28% 26% / 0.35)" strokeWidth="0.5" />
            <path d={midribD} stroke="hsl(125 22% 28% / 0.4)" strokeWidth="0.4" fill="none" />
          </g>
        );
      })}
      {/* Baby's breath */}
      <g>
        {dots.map((d, i) => (
          <g key={`d${i}`}>
            <circle cx={d.cx} cy={d.cy} r={d.r} fill="hsl(0 0% 97% / 0.7)" />
            <circle cx={d.cx} cy={d.cy} r={d.r * 0.4} fill="hsl(48 70% 70% / 0.6)" />
          </g>
        ))}
      </g>
    </g>
  );
};

const EucalyptusLeaves = ({ seed }: { seed: number }) => {
  const branches = useMemo(() => {
    const count = 7;
    return Array.from({ length: count }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const startX = 120 + side * (15 + seeded(seed + 3000, i) * 35);
      const startY = 180 + seeded(seed + 3100, i) * 30;
      const endX = startX + side * (35 + seeded(seed + 3200, i) * 55);
      const endY = 10 + seeded(seed + 3300, i) * 30;
      const ctrlX = (startX + endX) / 2 + side * seeded(seed + 3400, i) * 25;
      const ctrlY = (startY + endY) / 2 - 20;
      return {
        d: `M${startX.toFixed(0)} ${startY.toFixed(0)} Q${ctrlX.toFixed(0)} ${ctrlY.toFixed(0)}, ${endX.toFixed(0)} ${endY.toFixed(0)}`,
        startX, startY, endX, endY, ctrlX, ctrlY, side,
      };
    });
  }, [seed]);

  // Round eucalyptus leaves along each branch
  const branchLeaves = useMemo(() => {
    const result: { cx: number; cy: number; length: number; width: number; angle: number; shade: number }[] = [];
    branches.forEach((b, bi) => {
      const steps = 5 + Math.floor(seeded(seed + 3500, bi) * 4);
      for (let j = 0; j < steps; j++) {
        const t = (j + 1) / (steps + 1);
        // Quadratic bezier point
        const u = 1 - t;
        const px = u * u * b.startX + 2 * u * t * b.ctrlX + t * t * b.endX;
        const py = u * u * b.startY + 2 * u * t * b.ctrlY + t * t * b.endY;
        const leafSide = j % 2 === 0 ? -1 : 1;
        const jitter = (seeded(seed + 3600, bi * 10 + j) - 0.5) * 6;
        const length = 7 + seeded(seed + 3700, bi * 10 + j) * 7;
        const width = 4 + seeded(seed + 3800, bi * 10 + j) * 4;
        // Angle perpendicular to branch direction
        const dx = b.endX - b.startX;
        const dy = b.endY - b.startY;
        const branchAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
        const angle = branchAngle + leafSide * (60 + seeded(seed + 3900, bi * 10 + j) * 30);
        const shade = 28 + seeded(seed + 4000, bi * 10 + j) * 18;
        result.push({ cx: px + jitter, cy: py + jitter * 0.5, length, width, angle, shade });
      }
    });
    return result;
  }, [seed, branches]);

  return (
    <g>
      {/* Branch stems */}
      <g stroke="hsl(150 26% 38%)" strokeWidth="1.6" fill="none" strokeLinecap="round">
        {branches.map((b, i) => <path key={i} d={b.d} opacity="0.7" />)}
      </g>
      {/* Eucalyptus leaves - rounder, coin-shaped */}
      {branchLeaves.map((l, i) => {
        const { leafD, midribD } = makeLeafPath(l.cx, l.cy, l.length, l.width, l.angle);
        return (
          <g key={i}>
            <path d={leafD} fill={`hsl(155 ${l.shade}% 44% / 0.45)`} stroke="hsl(155 22% 32% / 0.3)" strokeWidth="0.5" />
            <path d={midribD} stroke="hsl(155 18% 34% / 0.35)" strokeWidth="0.3" fill="none" />
          </g>
        );
      })}
    </g>
  );
};

export default BouquetArrangement;
