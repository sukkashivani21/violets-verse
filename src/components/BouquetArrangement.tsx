import { useMemo } from "react";
import FlowerEmoji, { getTheme } from "@/components/FlowerEmoji";

interface BouquetArrangementProps {
  flowers: string[];
  size?: "sm" | "md" | "lg";
  layoutSeed?: number;
  greeneryStyle?: "classic" | "wild" | "eucalyptus";
}

const sizeMap = {
  sm: { container: "w-56 h-64", flower: 46 },
  md: { container: "w-72 h-80", flower: 56 },
  lg: { container: "w-80 h-[22rem]", flower: 66 },
};

const seeded = (seed: number, n: number) => {
  const x = Math.sin(seed * 97.11 + n * 41.23) * 10000;
  return x - Math.floor(x);
};

/**
 * Tight dome bouquet: flowers packed closely in overlapping concentric arcs
 */
const generateBouquetSlots = (seed: number, count: number) => {
  const slots: { x: number; y: number; z: number }[] = [];

  // Center of the bouquet head (sitting on the wrap)
  const cx = 50;
  const cy = 46;

  if (count === 1) {
    slots.push({ x: cx, y: cy, z: 30 });
    return slots;
  }

  // Place first flower at center
  slots.push({ x: cx + (seeded(seed, 0) - 0.5) * 4, y: cy + (seeded(seed, 1) - 0.5) * 3, z: 30 });

  // Remaining flowers in tight rings
  let placed = 1;
  let ring = 1;
  while (placed < count) {
    const ringCount = Math.min(count - placed, 3 + ring * 2);
    const radius = 10 + ring * 8 + seeded(seed + 5, ring) * 4;
    const fanAngle = Math.min(160, 90 + ring * 30 + seeded(seed + 2, ring) * 20);
    const startAngle = -fanAngle / 2;
    const angleOffset = seeded(seed + 20, ring) * 15; // rotate each ring differently

    for (let i = 0; i < ringCount && placed < count; i++) {
      const t = ringCount > 1 ? i / (ringCount - 1) : 0.5;
      const angle = (startAngle + t * fanAngle + angleOffset) * (Math.PI / 180);

      const bx = cx + Math.sin(angle) * radius;
      const by = cy - Math.cos(angle) * radius * 0.6; // compress vertically for dome

      // Small jitter
      const jx = (seeded(seed + 200, placed * 3) - 0.5) * 5;
      const jy = (seeded(seed + 300, placed * 3 + 1) - 0.5) * 4;

      slots.push({
        x: Math.max(12, Math.min(88, bx + jx)),
        y: Math.max(8, Math.min(55, by + jy)),
        z: 25 + ring * 2 + Math.round(seeded(seed + 400, placed) * 3),
      });
      placed++;
    }
    ring++;
  }

  // Shuffle by seed
  const indices = slots.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(seeded(seed + 999, i) * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.map((i) => slots[i]);
};

/* ── Organic leaf SVG path ── */
const makeLeafPath = (
  cx: number, cy: number,
  length: number, width: number,
  angle: number
) => {
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const rot = (px: number, py: number) => ({
    x: cx + px * cos - py * sin,
    y: cy + px * sin + py * cos,
  });

  const tip = rot(0, -length);
  const base = rot(0, 0);
  const lMid = rot(-width, -length * 0.4);
  const rMid = rot(width, -length * 0.4);
  const lCtrl1 = rot(-width * 0.6, -length * 0.8);
  const rCtrl1 = rot(width * 0.6, -length * 0.8);
  const lCtrl2 = rot(-width * 0.9, -length * 0.15);
  const rCtrl2 = rot(width * 0.9, -length * 0.15);

  const f = (p: {x:number;y:number}) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;

  const leafD = `M${f(base)} C${f(lCtrl2)}, ${f(lMid)}, ${f(lCtrl1)} Q${f(tip)}, ${f(tip)} Q${f(tip)}, ${f(rCtrl1)} C${f(rMid)}, ${f(rCtrl2)}, ${f(base)} Z`;

  const midTop = rot(0, -length * 0.9);
  const midribD = `M${f(base)} L${f(midTop)}`;

  // Side veins
  const veins: string[] = [];
  for (let v = 0; v < 3; v++) {
    const t = 0.2 + v * 0.25;
    const mp = rot(0, -length * t);
    const lv = rot(-width * 0.7, -length * (t + 0.12));
    const rv = rot(width * 0.7, -length * (t + 0.12));
    veins.push(`M${f(mp)} L${f(lv)}`);
    veins.push(`M${f(mp)} L${f(rv)}`);
  }

  return { leafD, midribD, veinsD: veins.join(" ") };
};

/* ── Wide, lush leaf path for background foliage ── */
const makeBigLeaf = (
  baseX: number, baseY: number,
  tipX: number, tipY: number,
  width: number
) => {
  const dx = tipX - baseX;
  const dy = tipY - baseY;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return { d: "", midrib: "" };
  const nx = (-dy / len) * width;
  const ny = (dx / len) * width;

  // Wide leaf: two cubic curves forming a pointed leaf shape
  const m1x = baseX + dx * 0.3 + nx * 1.2;
  const m1y = baseY + dy * 0.3 + ny * 1.2;
  const m2x = baseX + dx * 0.65 + nx * 0.8;
  const m2y = baseY + dy * 0.65 + ny * 0.8;
  const m3x = baseX + dx * 0.3 - nx * 1.2;
  const m3y = baseY + dy * 0.3 - ny * 1.2;
  const m4x = baseX + dx * 0.65 - nx * 0.8;
  const m4y = baseY + dy * 0.65 - ny * 0.8;

  const f = (v: number) => v.toFixed(1);

  const d = `M${f(baseX)} ${f(baseY)} C${f(m1x)} ${f(m1y)}, ${f(m2x)} ${f(m2y)}, ${f(tipX)} ${f(tipY)} C${f(m4x)} ${f(m4y)}, ${f(m3x)} ${f(m3y)}, ${f(baseX)} ${f(baseY)} Z`;

  const midCtrlX = baseX + dx * 0.5;
  const midCtrlY = baseY + dy * 0.5;
  const midrib = `M${f(baseX)} ${f(baseY)} Q${f(midCtrlX)} ${f(midCtrlY)}, ${f(tipX)} ${f(tipY)}`;

  return { d, midrib };
};

const BouquetArrangement = ({
  flowers,
  size = "md",
  layoutSeed = 7,
  greeneryStyle = "classic",
}: BouquetArrangementProps) => {
  const positions = useMemo(() => {
    if (!flowers.length) return [];

    const grouped: Record<string, number> = {};
    flowers.forEach((f) => (grouped[f] = (grouped[f] || 0) + 1));

    const sizeWeight = { large: 3, medium: 2, small: 1 } as const;
    const sortedGroups = Object.entries(grouped).sort(([a], [b]) =>
      sizeWeight[getTheme(b).sizeCategory] - sizeWeight[getTheme(a).sizeCategory]
    );

    const ordered = sortedGroups.flatMap(([key, count]) => Array(count).fill(key));
    const total = ordered.length;
    const slots = generateBouquetSlots(layoutSeed, total);

    return ordered.map((flower, i) => {
      const slot = slots[i];
      const centerOffset = (slot.x - 50) / 50;
      const tiltBase = centerOffset * 15;
      const tiltJ = (seeded(layoutSeed + 77, i) - 0.5) * 12;
      const rotate = tiltBase + tiltJ;
      const scaleBase = 0.9 + seeded(layoutSeed + 99, i) * 0.15;

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
        {/* ── Background greenery (behind flowers) ── */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 4 }}>
          <svg viewBox="0 0 240 280" className="w-full h-full" aria-hidden>
            <BackLeaves seed={layoutSeed} style={greeneryStyle} />
          </svg>
        </div>

        {/* ── Flowers ── */}
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

        {/* ── Foreground leaves (peeking between flowers) ── */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 35 }}>
          <svg viewBox="0 0 240 280" className="w-full h-full" aria-hidden>
            <FrontLeaves seed={layoutSeed} style={greeneryStyle} />
          </svg>
        </div>

        {/* ── Wrap ── */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{ zIndex: 40 }}>
          <svg width="82" height="68" viewBox="0 0 82 68" aria-hidden>
            <path
              d="M8 2 L41 2 L74 2 L66 62 Q54 68 41 68 Q28 68 16 62 Z"
              fill="hsl(35 42% 84% / 0.92)"
              stroke="hsl(30 28% 58%)"
              strokeWidth="1"
            />
            <path d="M14 12 Q41 18, 68 12" fill="none" stroke="hsl(30 20% 68% / 0.4)" strokeWidth="0.6" />
            <path d="M18 28 Q41 32, 64 28" fill="none" stroke="hsl(30 20% 68% / 0.3)" strokeWidth="0.5" />
            <path d="M20 42 Q41 46, 62 42" fill="none" stroke="hsl(30 20% 68% / 0.25)" strokeWidth="0.4" />
            {/* Ribbon */}
            <path d="M28 8 Q34 1, 41 6 Q48 1, 54 8" fill="none" stroke="hsl(340 50% 58%)" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M28 8 Q22 4, 24 10 Q26 15, 30 9" fill="none" stroke="hsl(340 50% 58%)" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M54 8 Q60 4, 58 10 Q56 15, 52 9" fill="none" stroke="hsl(340 50% 58%)" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="41" cy="7" r="2" fill="hsl(340 50% 58%)" />
          </svg>
        </div>
      </div>
    </div>
  );
};

/* ── Background leaves: large, lush leaves fanning from the gathering point ── */
const BackLeaves = ({ seed, style }: { seed: number; style: string }) => {
  const leaves = useMemo(() => {
    const count = style === "wild" ? 14 : style === "eucalyptus" ? 12 : 10;
    const gatherX = 120;
    const gatherY = 220; // moved up closer to flowers

    return Array.from({ length: count }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const spread = 15 + seeded(seed, i * 7) * 25;
      const angle = side * (spread + i * 4) * (Math.PI / 180);

      const len = 120 + seeded(seed + 100, i) * 110; // longer to reach past flowers
      const tipX = gatherX + Math.sin(angle) * len;
      const tipY = gatherY - Math.cos(angle) * len;
      const width = 14 + seeded(seed + 150, i) * 14;

      const hue = style === "eucalyptus" ? 155 : style === "wild" ? 118 : 132;
      const sat = 28 + seeded(seed + 200, i) * 18;
      const light = 32 + seeded(seed + 250, i) * 16;

      return { gatherX, gatherY, tipX, tipY, width, hue, sat, light };
    });
  }, [seed, style]);

  return (
    <g>
      {leaves.map((l, i) => {
        const { d, midrib } = makeBigLeaf(l.gatherX, l.gatherY, l.tipX, l.tipY, l.width);
        const fill = `hsl(${l.hue} ${l.sat}% ${l.light}% / 0.6)`;
        const stroke = `hsl(${l.hue} ${l.sat - 5}% ${l.light - 10}% / 0.5)`;
        return (
          <g key={i}>
            <path d={d} fill={fill} stroke={stroke} strokeWidth="0.8" />
            <path d={midrib} fill="none" stroke={`hsl(${l.hue} ${l.sat - 8}% ${l.light - 8}% / 0.5)`} strokeWidth="0.8" />
          </g>
        );
      })}

      {/* Extra small filler leaves for classic */}
      {style === "classic" && <ClassicFillerLeaves seed={seed} />}
      {style === "wild" && <WildAccents seed={seed} />}
      {style === "eucalyptus" && <EucalyptusAccents seed={seed} />}
    </g>
  );
};

/* ── Front leaves: smaller leaves peeking between flowers ── */
const FrontLeaves = ({ seed, style }: { seed: number; style: string }) => {
  const leaves = useMemo(() => {
    const count = style === "wild" ? 8 : 5;
    return Array.from({ length: count }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const cx = 120 + side * (30 + seeded(seed + 4000, i) * 60);
      const cy = 60 + seeded(seed + 4100, i) * 70;
      const length = 14 + seeded(seed + 4200, i) * 12;
      const width = 4 + seeded(seed + 4300, i) * 3;
      const angle = side * (30 + seeded(seed + 4400, i) * 50) - 10;
      const hue = style === "eucalyptus" ? 155 : style === "wild" ? 118 : 132;
      const sat = 30 + seeded(seed + 4500, i) * 15;
      const light = 36 + seeded(seed + 4600, i) * 14;
      return { cx, cy, length, width, angle, hue, sat, light };
    });
  }, [seed, style]);

  return (
    <g>
      {leaves.map((l, i) => {
        const { leafD, midribD } = makeLeafPath(l.cx, l.cy, l.length, l.width, l.angle);
        return (
          <g key={i}>
            <path d={leafD} fill={`hsl(${l.hue} ${l.sat}% ${l.light}% / 0.55)`} stroke={`hsl(${l.hue} 25% 28% / 0.3)`} strokeWidth="0.5" />
            <path d={midribD} fill="none" stroke={`hsl(${l.hue} 20% 30% / 0.4)`} strokeWidth="0.4" />
          </g>
        );
      })}
    </g>
  );
};

/* ── Classic: extra rounded leaves scattered around bouquet edges ── */
const ClassicFillerLeaves = ({ seed }: { seed: number }) => {
  const fills = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const cx = 120 + side * (40 + seeded(seed + 5000, i) * 65);
      const cy = 30 + seeded(seed + 5100, i) * 100;
      const length = 16 + seeded(seed + 5200, i) * 14;
      const width = 5 + seeded(seed + 5300, i) * 5;
      const angle = side * (25 + seeded(seed + 5400, i) * 55);
      return { cx, cy, length, width, angle };
    });
  }, [seed]);

  return (
    <g>
      {fills.map((l, i) => {
        const { leafD, midribD, veinsD } = makeLeafPath(l.cx, l.cy, l.length, l.width, l.angle);
        return (
          <g key={i}>
            <path d={leafD} fill="hsl(138 34% 42% / 0.4)" stroke="hsl(138 25% 30% / 0.3)" strokeWidth="0.5" />
            <path d={midribD} fill="none" stroke="hsl(138 20% 32% / 0.35)" strokeWidth="0.4" />
            <path d={veinsD} fill="none" stroke="hsl(138 18% 36% / 0.2)" strokeWidth="0.25" />
          </g>
        );
      })}
    </g>
  );
};

/* ── Wild: baby's breath dots + wispy grass blades ── */
const WildAccents = ({ seed }: { seed: number }) => {
  const dots = useMemo(() => {
    return Array.from({ length: 22 }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const cx = 120 + side * (20 + seeded(seed + 6000, i) * 85);
      const cy = 25 + seeded(seed + 6100, i) * 95;
      const r = 1.2 + seeded(seed + 6200, i) * 2;
      return { cx, cy, r };
    });
  }, [seed]);

  const grasses = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const baseX = 120;
      const tipX = 120 + side * (40 + seeded(seed + 6300, i) * 60);
      const tipY = 10 + seeded(seed + 6400, i) * 25;
      const ctrlX = (baseX + tipX) / 2 + side * seeded(seed + 6500, i) * 20;
      return `M120 245 Q${ctrlX.toFixed(0)} 100, ${tipX.toFixed(0)} ${tipY.toFixed(0)}`;
    });
  }, [seed]);

  return (
    <g>
      <g stroke="hsl(120 30% 42%)" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.4">
        {grasses.map((d, i) => <path key={i} d={d} />)}
      </g>
      {dots.map((d, i) => (
        <g key={`dot${i}`}>
          <circle cx={d.cx} cy={d.cy} r={d.r} fill="hsl(0 0% 97% / 0.75)" />
          <circle cx={d.cx} cy={d.cy} r={d.r * 0.35} fill="hsl(48 65% 68% / 0.6)" />
        </g>
      ))}
    </g>
  );
};

/* ── Eucalyptus: round coin-like leaves on curving branches ── */
const EucalyptusAccents = ({ seed }: { seed: number }) => {
  const branches = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const startX = 120 + side * (10 + seeded(seed + 7000, i) * 25);
      const startY = 200;
      const endX = startX + side * (40 + seeded(seed + 7100, i) * 50);
      const endY = 20 + seeded(seed + 7200, i) * 30;
      const ctrlX = (startX + endX) / 2 + side * seeded(seed + 7300, i) * 20;
      const ctrlY = 90 + seeded(seed + 7400, i) * 30;

      const coins: { cx: number; cy: number; r: number }[] = [];
      const steps = 5 + Math.floor(seeded(seed + 7500, i) * 3);
      for (let j = 0; j < steps; j++) {
        const t = (j + 1) / (steps + 1);
        const u = 1 - t;
        const px = u * u * startX + 2 * u * t * ctrlX + t * t * endX;
        const py = u * u * startY + 2 * u * t * ctrlY + t * t * endY;
        const leafSide = j % 2 === 0 ? -1 : 1;
        const off = 5 + seeded(seed + 7600, i * 10 + j) * 5;
        coins.push({
          cx: px + leafSide * off,
          cy: py + (seeded(seed + 7700, i * 10 + j) - 0.5) * 4,
          r: 4 + seeded(seed + 7800, i * 10 + j) * 4,
        });
      }

      return {
        d: `M${startX.toFixed(0)} ${startY.toFixed(0)} Q${ctrlX.toFixed(0)} ${ctrlY.toFixed(0)}, ${endX.toFixed(0)} ${endY.toFixed(0)}`,
        coins,
      };
    });
  }, [seed]);

  return (
    <g>
      {branches.map((b, i) => (
        <g key={i}>
          <path d={b.d} fill="none" stroke="hsl(155 26% 36%)" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
          {b.coins.map((c, j) => (
            <circle key={j} cx={c.cx} cy={c.cy} r={c.r} fill="hsl(158 32% 48% / 0.35)" stroke="hsl(158 22% 36% / 0.2)" strokeWidth="0.4" />
          ))}
        </g>
      ))}
    </g>
  );
};

export default BouquetArrangement;
