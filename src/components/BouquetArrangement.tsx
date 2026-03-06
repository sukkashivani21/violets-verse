import { useMemo } from "react";
import FlowerEmoji, { getTheme } from "@/components/FlowerEmoji";

interface BouquetArrangementProps {
  flowers: string[];
  size?: "sm" | "md" | "lg";
  layoutSeed?: number;
  greeneryStyle?: "classic" | "wild" | "eucalyptus";
}

const sizeMap = {
  sm: { container: "w-56 h-64", flower: 56 },
  md: { container: "w-72 h-80", flower: 68 },
  lg: { container: "w-80 h-[22rem]", flower: 78 },
};

const seeded = (seed: number, n: number) => {
  const x = Math.sin(seed * 97.11 + n * 41.23) * 10000;
  return x - Math.floor(x);
};

/* ── Dome arrangement: flowers packed in overlapping arcs ── */
const generateBouquetSlots = (seed: number, count: number) => {
  const slots: { x: number; y: number; z: number }[] = [];
  const cx = 50;
  const cy = 42;

  if (count === 1) {
    slots.push({ x: cx, y: cy, z: 30 });
    return slots;
  }

  slots.push({ x: cx + (seeded(seed, 0) - 0.5) * 4, y: cy + (seeded(seed, 1) - 0.5) * 3, z: 30 });

  let placed = 1;
  let ring = 1;
  while (placed < count) {
    const ringCount = Math.min(count - placed, 3 + ring * 2);
    const radius = 7 + ring * 7 + seeded(seed + 5, ring) * 3;
    const fanAngle = Math.min(160, 90 + ring * 22 + seeded(seed + 2, ring) * 18);
    const startAngle = -fanAngle / 2;
    const angleOffset = seeded(seed + 20, ring) * 18;

    for (let i = 0; i < ringCount && placed < count; i++) {
      const t = ringCount > 1 ? i / (ringCount - 1) : 0.5;
      const angle = (startAngle + t * fanAngle + angleOffset) * (Math.PI / 180);
      const bx = cx + Math.sin(angle) * radius;
      const by = cy - Math.cos(angle) * radius * 0.55;
      const jx = (seeded(seed + 200, placed * 3) - 0.5) * 5;
      const jy = (seeded(seed + 300, placed * 3 + 1) - 0.5) * 4;

      slots.push({
        x: Math.max(14, Math.min(86, bx + jx)),
        y: Math.max(10, Math.min(52, by + jy)),
        z: 25 + ring * 2 + Math.round(seeded(seed + 400, placed) * 3),
      });
      placed++;
    }
    ring++;
  }

  const indices = slots.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(seeded(seed + 999, i) * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.map((i) => slots[i]);
};

/* ── SVG Leaf Path Generators (sketchy / organic) ── */

const f = (v: number) => v.toFixed(1);

// Wobble helper: adds hand-drawn jitter to a coordinate
const wobble = (v: number, amount: number, seed: number, idx: number) =>
  v + (seeded(seed, idx) - 0.5) * amount;

// Generate a sketchy pointed leaf with asymmetric curves & serrated edges
const pointedLeaf = (bx: number, by: number, tipX: number, tipY: number, width: number, leafSeed = 0) => {
  const dx = tipX - bx, dy = tipY - by;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return "";
  const ux = dx / len, uy = dy / len;
  const nx = -uy * width, ny = ux * width;

  // Asymmetric bulge for natural look
  const bulgeL = 0.95 + (seeded(leafSeed + 50, 0) - 0.5) * 0.3;
  const bulgeR = 0.95 + (seeded(leafSeed + 51, 1) - 0.5) * 0.3;
  const peakL = 0.28 + seeded(leafSeed + 52, 2) * 0.12; // where widest point is
  const peakR = 0.28 + seeded(leafSeed + 53, 3) * 0.12;

  // Left side control points (base → tip)
  const l1x = bx + dx * peakL + nx * bulgeL * 1.15, l1y = by + dy * peakL + ny * bulgeL * 1.15;
  const l2x = bx + dx * 0.72 + nx * 0.5 * bulgeL, l2y = by + dy * 0.72 + ny * 0.5 * bulgeL;
  // Right side control points (tip → base)
  const r1x = bx + dx * 0.72 - nx * 0.5 * bulgeR, r1y = by + dy * 0.72 - ny * 0.5 * bulgeR;
  const r2x = bx + dx * peakR - nx * bulgeR * 1.15, r2y = by + dy * peakR - ny * bulgeR * 1.15;

  // Wobble tip slightly
  const wtx = wobble(tipX, 2, leafSeed + 60, 0);
  const wty = wobble(tipY, 2, leafSeed + 61, 1);

  return `M${f(bx)} ${f(by)} C${f(l1x)} ${f(l1y)},${f(l2x)} ${f(l2y)},${f(wtx)} ${f(wty)} C${f(r1x)} ${f(r1y)},${f(r2x)} ${f(r2y)},${f(bx)} ${f(by)}Z`;
};

// Generate vein paths for a leaf (midrib + side veins)
const leafVeins = (bx: number, by: number, tipX: number, tipY: number, width: number, veinSeed = 0): string[] => {
  const dx = tipX - bx, dy = tipY - by;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 8) return [];
  const ux = dx / len, uy = dy / len;
  const nx = -uy, ny = ux;
  const veins: string[] = [];

  // Midrib with slight curve
  const midCtrlX = (bx + tipX) / 2 + nx * width * (seeded(veinSeed, 0) - 0.5) * 0.3;
  const midCtrlY = (by + tipY) / 2 + ny * width * (seeded(veinSeed, 1) - 0.5) * 0.3;
  veins.push(`M${f(bx)} ${f(by)} Q${f(midCtrlX)} ${f(midCtrlY)},${f(bx + dx * 0.92)} ${f(by + dy * 0.92)}`);

  // Side veins branching from midrib
  const veinCount = Math.max(2, Math.floor(len / 16));
  for (let i = 1; i <= veinCount; i++) {
    const t = 0.15 + (i / (veinCount + 1)) * 0.65;
    const px = bx + dx * t, py = by + dy * t;
    const side = i % 2 === 0 ? 1 : -1;
    const vLen = width * (0.6 + seeded(veinSeed + 10, i) * 0.4) * (1 - t * 0.4);
    const angle = side * (35 + seeded(veinSeed + 20, i) * 25) * (Math.PI / 180);
    const vx = px + (nx * side * Math.cos(angle) + ux * Math.sin(angle)) * vLen;
    const vy = py + (ny * side * Math.cos(angle) + uy * Math.sin(angle)) * vLen;
    veins.push(`M${f(px)} ${f(py)} L${f(vx)} ${f(vy)}`);
  }
  return veins;
};

// Round filler leaf with organic shape
const roundLeaf = (cx: number, cy: number, r: number, angle: number) => {
  const rad = (angle * Math.PI) / 180;
  const tx = cx + Math.sin(rad) * r * 1.3;
  const ty = cy - Math.cos(rad) * r * 1.3;
  const w = r * 0.75;
  return pointedLeaf(cx, cy, tx, ty, w, Math.round(cx * 7 + cy * 13));
};

// Fern frond: curved stem with alternating sketchy leaflets
const fernFrond = (startX: number, startY: number, tipX: number, tipY: number, seed: number, idx: number) => {
  const paths: { d: string; isStem: boolean }[] = [];
  const dx = tipX - startX, dy = tipY - startY;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return paths;
  const ux = dx / len, uy = dy / len;
  const nx = -uy, ny = ux;

  // Curved main stem (not straight)
  const stemBow = (seeded(seed + 800, idx) - 0.5) * 14;
  const scx = (startX + tipX) / 2 + nx * stemBow;
  const scy = (startY + tipY) / 2 + ny * stemBow;
  paths.push({ d: `M${f(startX)} ${f(startY)} Q${f(scx)} ${f(scy)},${f(tipX)} ${f(tipY)}`, isStem: true });

  // Leaflets with varied sizes
  const count = 7 + Math.floor(seeded(seed + 810, idx) * 5);
  for (let i = 1; i < count; i++) {
    const t = i / count;
    // Point on curved stem
    const u2 = 1 - t;
    const px = u2 * u2 * startX + 2 * u2 * t * scx + t * t * tipX;
    const py = u2 * u2 * startY + 2 * u2 * t * scy + t * t * tipY;
    const side = i % 2 === 0 ? 1 : -1;
    const leafLen = (1 - t * 0.65) * len * 0.22 + seeded(seed + 820, idx * 20 + i) * 4;
    const splay = 0.35 + seeded(seed + 830, idx * 20 + i) * 0.15;
    const lx = px + (nx * side * (1 - splay) + ux * splay) * leafLen;
    const ly = py + (ny * side * (1 - splay) + uy * splay) * leafLen;
    // Tiny leaf shape
    const leafW = leafLen * 0.3;
    const ld = pointedLeaf(px, py, lx, ly, leafW, seed + 840 + i);
    if (ld) paths.push({ d: ld, isStem: false });
  }
  return paths;
};

// Thin branchy leaf (delicate herb) with organic curves
const thinBranch = (startX: number, startY: number, tipX: number, tipY: number, seed: number, idx: number) => {
  const paths: { d: string; isStem: boolean }[] = [];
  const dx = tipX - startX, dy = tipY - startY;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return paths;
  const ux = dx / len, uy = dy / len;
  const nx = -uy, ny = ux;

  // S-curved main stem for organic feel
  const bow1 = (seeded(seed + 900, idx) - 0.3) * 16;
  const bow2 = (seeded(seed + 901, idx) - 0.7) * 12;
  const c1x = startX + dx * 0.33 + nx * bow1;
  const c1y = startY + dy * 0.33 + ny * bow1;
  const c2x = startX + dx * 0.66 + nx * bow2;
  const c2y = startY + dy * 0.66 + ny * bow2;
  paths.push({ d: `M${f(startX)} ${f(startY)} C${f(c1x)} ${f(c1y)},${f(c2x)} ${f(c2y)},${f(tipX)} ${f(tipY)}`, isStem: true });

  // Leaves along the S-curve
  const count = 5 + Math.floor(seeded(seed + 910, idx) * 3);
  for (let i = 1; i <= count; i++) {
    const t = i / (count + 1);
    // Cubic bezier point
    const u2 = 1 - t;
    const px = u2*u2*u2*startX + 3*u2*u2*t*c1x + 3*u2*t*t*c2x + t*t*t*tipX;
    const py = u2*u2*u2*startY + 3*u2*u2*t*c1y + 3*u2*t*t*c2y + t*t*t*tipY;
    const side = i % 2 === 0 ? 1 : -1;
    const leafSize = 5 + seeded(seed + 920, idx * 10 + i) * 6;
    const splay = 0.3 + seeded(seed + 930, idx * 10 + i) * 0.2;
    const lx = px + (nx * side * (1 - splay) + ux * splay) * leafSize;
    const ly = py + (ny * side * (1 - splay) + uy * splay) * leafSize;
    const w = leafSize * 0.38;
    const ld = pointedLeaf(px, py, lx, ly, w, seed + 940 + i);
    if (ld) paths.push({ d: ld, isStem: false });
  }
  return paths;
};

// Tropical long leaf — wider, slightly asymmetric
const tropicalLeaf = (bx: number, by: number, tipX: number, tipY: number, width: number, leafSeed = 0) => {
  return pointedLeaf(bx, by, tipX, tipY, width * 1.1, leafSeed);
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
      const tiltBase = centerOffset * 12;
      const tiltJ = (seeded(layoutSeed + 77, i) - 0.5) * 10;
      const rotate = tiltBase + tiltJ;
      const scaleBase = 0.95 + seeded(layoutSeed + 99, i) * 0.15;

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
        {/* Background greenery */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 4 }}>
          <svg viewBox="0 0 240 280" className="w-full h-full" aria-hidden>
            <BackFoliage seed={layoutSeed} style={greeneryStyle} />
          </svg>
        </div>

        {/* Flowers */}
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

        {/* Front accent leaves */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 35 }}>
          <svg viewBox="0 0 240 280" className="w-full h-full" aria-hidden>
            <FrontAccents seed={layoutSeed} style={greeneryStyle} />
          </svg>
        </div>

        {/* Wrap / pot */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{ zIndex: 40 }}>
          <WrapSVG />
        </div>
      </div>
    </div>
  );
};

/* ── Kraft paper wrap ── */
const WrapSVG = () => (
  <svg width="86" height="72" viewBox="0 0 86 72" aria-hidden>
    <path
      d="M6 2 L43 2 L80 2 L72 66 Q58 72 43 72 Q28 72 14 66 Z"
      fill="hsl(35 38% 82%)"
      stroke="hsl(30 24% 54%)"
      strokeWidth="1"
    />
    {/* Paper texture lines */}
    <path d="M12 14 Q43 20, 74 14" fill="none" stroke="hsl(30 18% 66% / 0.35)" strokeWidth="0.5" />
    <path d="M16 30 Q43 34, 70 30" fill="none" stroke="hsl(30 18% 66% / 0.3)" strokeWidth="0.4" />
    <path d="M18 44 Q43 48, 68 44" fill="none" stroke="hsl(30 18% 66% / 0.2)" strokeWidth="0.4" />
    {/* Twine bow */}
    <path d="M30 8 Q36 1, 43 6 Q50 1, 56 8" fill="none" stroke="hsl(28 35% 50%)" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M30 8 Q24 4, 26 11 Q28 16, 32 9" fill="none" stroke="hsl(28 35% 50%)" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M56 8 Q62 4, 60 11 Q58 16, 54 9" fill="none" stroke="hsl(28 35% 50%)" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="43" cy="7" r="2" fill="hsl(28 35% 50%)" />
  </svg>
);

/* ── Background foliage ── */
const BackFoliage = ({ seed, style }: { seed: number; style: string }) => {
  const elements = useMemo(() => {
    const gx = 120, gy = 225;
    const result: JSX.Element[] = [];

    // Large pointed leaves fanning out
    const bigLeafCount = style === "wild" ? 12 : style === "eucalyptus" ? 10 : 9;
    for (let i = 0; i < bigLeafCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const spread = 18 + seeded(seed, i * 7) * 28;
      const angle = side * (spread + i * 5) * (Math.PI / 180);
      const len = 100 + seeded(seed + 100, i) * 120;
      const tipX = gx + Math.sin(angle) * len;
      const tipY = gy - Math.cos(angle) * len;
      const width = style === "eucalyptus" ? 10 + seeded(seed + 150, i) * 8 : 12 + seeded(seed + 150, i) * 14;

      const hue = style === "eucalyptus" ? 158 : style === "wild" ? 125 : 138;
      const sat = 25 + seeded(seed + 200, i) * 20;
      const light = 34 + seeded(seed + 250, i) * 16;

      const leafSeed = seed + 3000 + i * 17;
      const d = style === "eucalyptus"
        ? pointedLeaf(gx, gy, tipX, tipY, width * 0.8, leafSeed)
        : tropicalLeaf(gx, gy, tipX, tipY, width, leafSeed);

      if (!d) continue;

      // Veins
      const veins = leafVeins(gx, gy, tipX, tipY, width, seed + 4000 + i * 13);

      result.push(
        <g key={`bl${i}`}>
          <path d={d} fill={`hsl(${hue} ${sat}% ${light}% / 0.55)`} stroke={`hsl(${hue} ${sat - 5}% ${light - 12}% / 0.45)`} strokeWidth="0.7" />
          {veins.map((vd, vi) => (
            <path key={vi} d={vd} fill="none" stroke={`hsl(${hue} ${sat - 8}% ${light - 8}% / ${vi === 0 ? 0.4 : 0.25})`} strokeWidth={vi === 0 ? "0.6" : "0.35"} strokeLinecap="round" />
          ))}
        </g>
      );
    }

    // Fern fronds (2-4 depending on style)
    const fernCount = style === "wild" ? 4 : style === "eucalyptus" ? 2 : 3;
    for (let i = 0; i < fernCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const spread = 25 + seeded(seed + 500, i) * 35;
      const angle = side * spread * (Math.PI / 180);
      const len = 110 + seeded(seed + 510, i) * 80;
      const tipX = gx + Math.sin(angle) * len * (0.7 + seeded(seed + 520, i) * 0.5);
      const tipY = gy - Math.cos(angle) * len;

      const frondPaths = fernFrond(gx, gy, tipX, tipY, seed, i);
      const hue = style === "eucalyptus" ? 155 : 130;

      result.push(
        <g key={`fern${i}`} opacity="0.5">
          {frondPaths.map((item, j) => (
            <path key={j} d={item.d}
              fill={item.isStem ? "none" : `hsl(${hue} 30% 40% / 0.3)`}
              stroke={`hsl(${hue} 28% 38%)`}
              strokeWidth={item.isStem ? "0.8" : "0.4"}
              strokeLinecap="round"
            />
          ))}
        </g>
      );
    }

    // Round filler leaves scattered at edges
    const fillerCount = style === "classic" ? 8 : style === "wild" ? 10 : 6;
    for (let i = 0; i < fillerCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const cx = 120 + side * (35 + seeded(seed + 600, i) * 60);
      const cy = 40 + seeded(seed + 610, i) * 90;
      const r = 8 + seeded(seed + 620, i) * 8;
      const angle = side * (20 + seeded(seed + 630, i) * 60);
      const hue = style === "eucalyptus" ? 160 : 140;

      const d = roundLeaf(cx, cy, r, angle);
      if (!d) continue;

      result.push(
        <path key={`fill${i}`} d={d}
          fill={`hsl(${hue} 28% 44% / 0.35)`}
          stroke={`hsl(${hue} 22% 34% / 0.25)`}
          strokeWidth="0.5"
        />
      );
    }

    // Thin decorative branches
    const branchCount = style === "wild" ? 5 : 3;
    for (let i = 0; i < branchCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const angle = side * (20 + seeded(seed + 700, i) * 40) * (Math.PI / 180);
      const len = 90 + seeded(seed + 710, i) * 70;
      const tipX = gx + Math.sin(angle) * len;
      const tipY = gy - Math.cos(angle) * len;

      const branchPaths = thinBranch(gx, gy, tipX, tipY, seed, i);
      const hue = style === "eucalyptus" ? 152 : 135;

      result.push(
        <g key={`branch${i}`} opacity="0.45">
          {branchPaths.map((d, j) => (
            <path key={j} d={d}
              fill={j === 0 ? "none" : `hsl(${hue} 26% 42% / 0.3)`}
              stroke={`hsl(${hue} 24% 36%)`}
              strokeWidth={j === 0 ? "0.7" : "0.3"}
              strokeLinecap="round"
            />
          ))}
        </g>
      );
    }

    // Style-specific accents
    if (style === "wild") {
      // Baby's breath dots
      for (let i = 0; i < 20; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const cx = 120 + side * (20 + seeded(seed + 1000, i) * 80);
        const cy = 25 + seeded(seed + 1010, i) * 90;
        const r = 1.2 + seeded(seed + 1020, i) * 1.8;
        result.push(
          <g key={`bb${i}`}>
            <circle cx={cx} cy={cy} r={r} fill="hsl(0 0% 97% / 0.7)" />
            <circle cx={cx} cy={cy} r={r * 0.35} fill="hsl(48 60% 68% / 0.5)" />
          </g>
        );
      }
    }

    if (style === "eucalyptus") {
      // Eucalyptus coin leaves on branches
      for (let i = 0; i < 4; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const sx = gx + side * (8 + seeded(seed + 1100, i) * 20);
        const ex = sx + side * (40 + seeded(seed + 1110, i) * 50);
        const ey = 20 + seeded(seed + 1120, i) * 30;
        const ctrlX = (sx + ex) / 2 + side * seeded(seed + 1130, i) * 18;
        const ctrlY = 100 + seeded(seed + 1140, i) * 30;

        const f = (v: number) => v.toFixed(1);
        const branchD = `M${f(sx)} ${f(gy)} Q${f(ctrlX)} ${f(ctrlY)},${f(ex)} ${f(ey)}`;

        const coins: JSX.Element[] = [];
        const steps = 5 + Math.floor(seeded(seed + 1150, i) * 3);
        for (let j = 0; j < steps; j++) {
          const t = (j + 1) / (steps + 1);
          const u = 1 - t;
          const px = u * u * sx + 2 * u * t * ctrlX + t * t * ex;
          const py = u * u * gy + 2 * u * t * ctrlY + t * t * ey;
          const lside = j % 2 === 0 ? -1 : 1;
          const off = 5 + seeded(seed + 1160, i * 10 + j) * 5;
          const cr = 4 + seeded(seed + 1170, i * 10 + j) * 4;
          coins.push(
            <circle key={j} cx={px + lside * off} cy={py} r={cr}
              fill="hsl(158 30% 52% / 0.3)"
              stroke="hsl(158 20% 38% / 0.2)"
              strokeWidth="0.4"
            />
          );
        }

        result.push(
          <g key={`euc${i}`} opacity="0.55">
            <path d={branchD} fill="none" stroke="hsl(155 24% 38%)" strokeWidth="1" strokeLinecap="round" />
            {coins}
          </g>
        );
      }
    }

    return result;
  }, [seed, style]);

  return <g>{elements}</g>;
};

/* ── Front accent leaves peeking between flowers ── */
const FrontAccents = ({ seed, style }: { seed: number; style: string }) => {
  const elements = useMemo(() => {
    const result: JSX.Element[] = [];
    const count = style === "wild" ? 7 : 5;

    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const cx = 120 + side * (28 + seeded(seed + 2000, i) * 55);
      const cy = 55 + seeded(seed + 2010, i) * 65;
      const len = 14 + seeded(seed + 2020, i) * 12;
      const angle = side * (30 + seeded(seed + 2030, i) * 50);
      const rad = (angle * Math.PI) / 180;
      const tipX = cx + Math.sin(rad) * len;
      const tipY = cy - Math.cos(rad) * len;
      const width = 4 + seeded(seed + 2040, i) * 3;

      const hue = style === "eucalyptus" ? 158 : style === "wild" ? 125 : 138;
      const d = pointedLeaf(cx, cy, tipX, tipY, width);
      if (!d) continue;

      const f = (v: number) => v.toFixed(1);
      const midrib = `M${f(cx)} ${f(cy)} L${f(cx + (tipX - cx) * 0.85)} ${f(cy + (tipY - cy) * 0.85)}`;

      result.push(
        <g key={`fa${i}`}>
          <path d={d} fill={`hsl(${hue} 28% 40% / 0.5)`} stroke={`hsl(${hue} 22% 30% / 0.3)`} strokeWidth="0.5" />
          <path d={midrib} fill="none" stroke={`hsl(${hue} 20% 32% / 0.35)`} strokeWidth="0.4" />
        </g>
      );
    }

    return result;
  }, [seed, style]);

  return <g>{elements}</g>;
};

export default BouquetArrangement;
